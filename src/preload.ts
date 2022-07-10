import { IpcRendererEvent } from "electron";

const { contextBridge, ipcRenderer } = require('electron')

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener("DOMContentLoaded", () => {
  const replaceText = (selector: string, text: string) => {
    const element = document.getElementById(selector);
    if (element) {
      element.innerText = text;
    }
  };

  for (const type of ["chrome", "node", "electron"]) {
    replaceText(`${type}-version`, process.versions[type as keyof NodeJS.ProcessVersions]);
  }

  contextBridge.exposeInMainWorld('electronAPI', {
    setIgnoreMouseEvents: (yes: boolean, forward: { forward: boolean } = { forward: false }) => {
      ipcRenderer.send('set-ignore-mouse-events', yes, forward);
    },
    toggleWindow: (callback: any) => {
      ipcRenderer.on('toggle-window', callback);
    }
  })
});
