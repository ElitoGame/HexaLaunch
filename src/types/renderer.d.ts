import { IpcRendererEvent } from "electron";

export interface IElectronAPI {
    setIgnoreMouseEvents: (yes: boolean, forward: { forward: boolean }) => Promise<void>,
    toggleWindow: (callback: (event: IpcRendererEvent, value: boolean) => void) => void,
}

declare global {
    interface Window {
        electronAPI: IElectronAPI
    }
}