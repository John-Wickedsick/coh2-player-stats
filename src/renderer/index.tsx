import React from 'react';
import { render, hydrate } from 'react-dom';
import MatchView from './MatchView';
import DetailView from './DetailView';
import LoadingView from './LoadingView';

/* const emptyData = {
  left: [] as any[],
  right: [] as any[],
}; */
let windowType = 'loading';

render(<LoadingView />, document.getElementById('root'));

declare global {
  interface Window {
    electron: any;
  }
}
window.electron.ipcRenderer.register();

window.electron.ipcRenderer.once('register', (arg) => {
  windowType = arg;
});

window.electron.ipcRenderer.on('match', (arg: any) => {
  if (windowType === 'main') {
    hydrate(<MatchView players={arg} />, document.getElementById('root'));
  }
});

window.electron.ipcRenderer.on('inspect', (arg: any) => {
  if (windowType === 'inspector') {
    hydrate(<DetailView player={arg} />, document.getElementById('root'));
  }
});
