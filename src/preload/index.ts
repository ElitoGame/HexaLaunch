import { electronAPI } from '@electron-toolkit/preload';
const { contextBridge, ipcRenderer } = require('electron');

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
      setIgnoreMouseEvents: (yes: boolean, forward: { forward: boolean } = { forward: false }) => {
        ipcRenderer.send('set-ignore-mouse-events', yes, forward);
      },
      toggleWindow: (callback: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => {
        ipcRenderer.on('toggle-window', callback);
      },
      getMousePosition: (callback: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => {
        ipcRenderer.on('set-mouse-position', callback);
      },
      openApp: (app: string, url: string) => {
        ipcRenderer.invoke('hexUI:openApp', app, url);
      },
      getHexUiData: (callback: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => {
        ipcRenderer.on('hexUI:getHexUiData', callback);
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
