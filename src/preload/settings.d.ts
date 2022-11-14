import { ElectronAPI } from '@electron-toolkit/preload';
import SettingsData from '../renderer/src/Settings/SettingsData';

export interface NewElectronAPI {
  sendData: (dataToSubmit: SettingsData) => void;
}

declare global {
  interface Window {
    electronAPI: NewElectronAPI;
    electron: ElectronAPI;
    api: unknown;
  }
}
