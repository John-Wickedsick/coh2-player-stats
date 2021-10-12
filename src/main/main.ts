/* eslint-disable no-await-in-loop */
/* eslint-disable no-plusplus */
/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import path from 'path';
import lineReader from 'reverse-line-reader';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import {
  getPlayerMatchData,
  getPlayerLeaderboardData,
} from './statsProcessing';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';

const filename = path.resolve(
  app.getPath('documents'),
  'My Games',
  'Company of Heroes 2',
  'warnings.log'
);

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;
let inspectorWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDevelopment =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDevelopment) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createInspectorWindow = async () => {
  if (isDevelopment) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  inspectorWindow = new BrowserWindow({
    show: true,
    width: 800,
    height: 900,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preloadInspector.js'),
    },
  });

  inspectorWindow.loadURL(resolveHtmlPath('index.html'));

  inspectorWindow.on('ready-to-show', () => {
    if (!inspectorWindow) {
      throw new Error('"inspectorWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      inspectorWindow.minimize();
    } else {
      inspectorWindow.show();
      inspectorWindow.focus();
    }
  });

  inspectorWindow.on('closed', () => {
    inspectorWindow = null;
  });

  const menuBuilder = new MenuBuilder(inspectorWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  inspectorWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

const createWindow = async () => {
  if (isDevelopment) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: true,
    width: 800,
    height: 900,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preloadMain.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.on('close', async () => {
    inspectorWindow?.close();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

let uniqueGameID = '';
let players = {
  left: [] as any[],
  right: [] as any[],
};
let inspectedPlayerRelicID: string | null = null;
let inspectedPlayer = {};

const checkForPlayerData = () => {
  let foundNewGame = false;
  let constructedGameID = '';
  const tempPlayers = {
    left: [] as any[],
    right: [] as any[],
  };

  // eslint-disable-next-line promise/catch-or-return
  lineReader
    .eachLine(filename, (line: string) => {
      const noTimeCode = line.substring(14);
      const firstSpace = noTimeCode.indexOf(' ');
      if (firstSpace !== -1) {
        const logType = noTimeCode.substring(0, firstSpace);
        if (logType === 'GAME') {
          const paramSeperator = noTimeCode.indexOf(' -- ');
          if (paramSeperator !== -1) {
            const params = noTimeCode.substring(paramSeperator + 4);
            const subLogTypeSeparator = params.indexOf(':');
            if (subLogTypeSeparator !== -1) {
              const subLogType = params.substring(0, subLogTypeSeparator);
              const remainingData = params.substring(subLogTypeSeparator + 1);
              if (subLogType === 'Win Condition Name') {
                if (constructedGameID !== uniqueGameID) {
                  players = tempPlayers;
                  foundNewGame = true;
                  uniqueGameID = constructedGameID;
                }
                return false;
              }
              if (subLogType === 'Human Player') {
                const playerDataChunks = remainingData.split(' ');
                const playerData = {
                  ai: false,
                  faction: playerDataChunks[playerDataChunks.length - 1],
                  side: playerDataChunks[playerDataChunks.length - 2],
                  relicID: playerDataChunks[playerDataChunks.length - 3],
                  position: playerDataChunks[1],
                  name: playerDataChunks
                    .slice(2, playerDataChunks.length - 3)
                    .join(' '),
                };
                if (playerData.side === '0') {
                  tempPlayers.left.unshift(playerData);
                } else {
                  tempPlayers.right.unshift(playerData);
                }
                constructedGameID += `${playerData.relicID} `;
              }
              if (subLogType === 'AI Player') {
                const playerDataChunks = remainingData.split(' ');
                const playerData = {
                  ai: true,
                  faction: playerDataChunks[playerDataChunks.length - 1],
                  side: playerDataChunks[playerDataChunks.length - 2],
                  relicID: '-1',
                  position: playerDataChunks[1],
                  name: playerDataChunks
                    .slice(2, playerDataChunks.length - 3)
                    .join(' '),
                };
                if (playerData.side === '0') {
                  tempPlayers.left.unshift(playerData);
                } else {
                  tempPlayers.right.unshift(playerData);
                }
                constructedGameID += '-1 ';
              }
              if (subLogType === 'Starting mission') {
                // haveCompletePlayerList = true;
              }
            }
          }
        }
      }
      return true;
    })
    .then(async () => {
      if (foundNewGame) {
        for (let i = 0; i < players.left.length; i++) {
          if (!players.left[i].ai) {
            players.left[i] = await getPlayerMatchData(
              players.left[i],
              players.left
            );
          }
        }
        for (let i = 0; i < players.right.length; i++) {
          if (!players.right[i].ai) {
            players.right[i] = await getPlayerMatchData(
              players.right[i],
              players.right
            );
          }
        }
      }
    });
  mainWindow?.webContents.send('match', players);
};

let checkForGamesInterval: NodeJS.Timer;

/**
 * Add event listeners...
 */

ipcMain.on('register', async (event, arg) => {
  event.reply('register', arg);
  if (arg === 'inspector' && inspectedPlayerRelicID) {
    inspectorWindow?.webContents.send('inspect', inspectedPlayer);
  }
});

ipcMain.on('inspect', async (event, arg) => {
  inspectedPlayer = await getPlayerLeaderboardData({ relicID: arg });
  inspectedPlayerRelicID = arg;
  if (inspectorWindow === null) createInspectorWindow();
  event.reply('inspect', inspectedPlayer);
  inspectorWindow?.webContents.send('inspect', inspectedPlayer);
});

ipcMain.on('match', async (event) => {
  event.reply('match', players);
});

app.on('window-all-closed', () => {
  clearInterval(checkForGamesInterval);
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    checkForGamesInterval = setInterval(checkForPlayerData, 2000);
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
