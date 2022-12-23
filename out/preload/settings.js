"use strict";
const preload = require("@electron-toolkit/preload");
const { contextBridge, ipcRenderer } = require("electron");
const api = {};
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", preload.electronAPI);
    contextBridge.exposeInMainWorld("api", api);
    contextBridge.exposeInMainWorld("electronAPI", {
      sendData: (dataToSubmit) => {
        console.log(JSON.stringify(dataToSubmit) + "from preload");
        ipcRenderer.send("settings", dataToSubmit);
      },
      search: (query, offset) => ipcRenderer.invoke("settings:search", query, offset),
      addApp: (app) => {
        console.log("Preload: addApp: " + app);
        return ipcRenderer.invoke("settings:addApp", app);
      },
      getRelevantApps: () => ipcRenderer.invoke("settings:getRelevantApps")
    });
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = preload.electronAPI;
  window.api = api;
}
