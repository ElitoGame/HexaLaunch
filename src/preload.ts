import { IpcRendererEvent } from "electron";

const { contextBridge, ipcRenderer } = require('electron')

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener("DOMContentLoaded", () => {

  contextBridge.exposeInMainWorld('electronAPI', {
    setIgnoreMouseEvents: (yes: boolean, forward: { forward: boolean } = { forward: false }) => {
      ipcRenderer.send('set-ignore-mouse-events', yes, forward);
    },
    toggleWindow: (callback: any) => {
      ipcRenderer.on('toggle-window', callback);
    }
  })
});
