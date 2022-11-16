import { ElectronAPI } from '@electron-toolkit/preload';

declare global {
  interface Window {
    electronAPI: IElectronAPI;
    electron: ElectronAPI;
    api: unknown;
  }
}
