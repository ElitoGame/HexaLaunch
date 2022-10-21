import { ElectronAPI } from '@electron-toolkit/preload';
import { IpcRendererEvent } from 'electron';

export interface IElectronAPI {
  openApp(url: string): unknown;
  setIgnoreMouseEvents: (yes: boolean, forward: { forward: boolean }) => Promise<void>;
  toggleWindow: (callback: (event: IpcRendererEvent, value: boolean) => void) => void;
  getMousePosition: (
    callback: (event: IpcRendererEvent, value: { x: number; y: number }) => void
  ) => void;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
    electron: ElectronAPI;
    api: unknown;
  }
}
