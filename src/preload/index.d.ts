import { ElectronAPI } from '@electron-toolkit/preload';
import { IpcRendererEvent } from 'electron';
import HexUiData from '../../renderer/src/DataModel/HexUiData';

export interface IElectronAPI {
  sendData: (dataToSubmit: SettingsData) => void;
  openApp(app: string, url: string): unknown;
  runAction(action: string, option?: string): unknown;
  setIgnoreMouseEvents: (yes: boolean, forward: { forward: boolean }) => Promise<void>;
  toggleWindow: (callback: (event: IpcRendererEvent, value: boolean) => void) => void;
  getMousePosition: (
    callback: (event: IpcRendererEvent, value: { x: number; y: number }) => void
  ) => void;
  getHexUiData: (callback: (event: IpcRendererEvent, value: HexUiData) => void) => void;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
    electron: ElectronAPI;
    api: unknown;
  }
}
