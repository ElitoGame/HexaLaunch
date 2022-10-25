import HexUiData from './DataModel/HexUiData';
export interface UserSettings {
  autoLaunch: boolean;
  language: string;
  hexUI: HexUiData | undefined;
}
