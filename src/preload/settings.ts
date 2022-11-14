import { electronAPI } from '@electron-toolkit/preload';
const { contextBridge } = require('electron');
const ipcRenderer = require('electron').ipcRenderer;

// Custom APIs for renderer
const api = {};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
    contextBridge.exposeInMainWorld('electronAPI', {
      sendData: (dataToSubmit: any[]) => {
        console.log(JSON.stringify(dataToSubmit) + 'from preload');
        ipcRenderer.send('settings', dataToSubmit);
      },
    });
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
}
