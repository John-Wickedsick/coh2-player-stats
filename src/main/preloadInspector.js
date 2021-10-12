const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    inspect(relicID) {
      ipcRenderer.send('inspect', relicID);
    },
    register() {
      ipcRenderer.send('register', 'inspector');
    },
    on(channel, func) {
      const validChannels = ['match', 'register', 'inspect', 'view'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    once(channel, func) {
      const validChannels = ['match', 'register', 'inspect', 'view'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.once(channel, (event, ...args) => func(...args));
      }
    },
  },
});
