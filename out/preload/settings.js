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
      setIgnoreMouseEvents: (yes, forward = { forward: false }) => {
        ipcRenderer.send("set-ignore-mouse-events", yes, forward);
      },
      toggleWindow: (callback) => {
        ipcRenderer.on("toggle-window", callback);
      },
      getMousePosition: (callback) => {
        ipcRenderer.on("set-mouse-position", callback);
      },
      openApp: (app, url) => {
        ipcRenderer.invoke("hexUI:openApp", app, url);
      },
      runAction: (action, option) => {
        ipcRenderer.invoke("hexUI:runAction", action, option);
      },
      getHexUiData: (callback) => {
        ipcRenderer.on("hexUI:getHexUiData", callback);
        console.log(callback.arguments);
      },
      getSettingsData: (callback) => {
        ipcRenderer.on("hexUI:getSettingsData", callback);
        console.log(callback.arguments);
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
