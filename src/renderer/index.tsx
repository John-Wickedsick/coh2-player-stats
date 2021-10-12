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
let viewMode = 'normal';
let lastMatchData = {
  left: [] as any[],
  right: [] as any[],
};
let lastInspectData = {};

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

window.electron.ipcRenderer.on('view', (arg: any) => {
  viewMode = arg;
  if (windowType === 'main') {
    hydrate(
      <MatchView players={lastMatchData} viewMode={viewMode} />,
      document.getElementById('root')
    );
  } else if (windowType === 'inspector') {
    hydrate(
      <DetailView player={lastInspectData} />,
      document.getElementById('root')
    );
  }
});

window.electron.ipcRenderer.on('match', (arg: any) => {
  if (windowType === 'main') {
    lastMatchData = arg;
    hydrate(
      <MatchView players={arg} viewMode={viewMode} />,
      document.getElementById('root')
    );
  }
});

window.electron.ipcRenderer.on('inspect', (arg: any) => {
  if (windowType === 'inspector') {
    lastInspectData = arg;
    hydrate(<DetailView player={arg} />, document.getElementById('root'));
  }
});
