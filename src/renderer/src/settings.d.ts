import { Accessor, Setter } from 'solid-js';
import SettingsData from './Settings/SettingsData';
import HexUiData from './DataModel/HexUiData';

export declare const getSettingsData: Accessor<SettingsData>,
  setSettingsData: Setter<SettingsData>,
  getRelevantApps: () => {
    executable: string;
    name: string;
    icon: string;
  }[];

export declare const getShowPosition: Accessor<{
    x: number;
    y: number;
  }>,
  setShowPosition: Setter<{
    x: number;
    y: number;
  }>,
  openApp: (app: string, url: string) => void,
  runAction: (action: string, option?: string) => void,
  getHexSize: Accessor<number>,
  getHexMargin: Accessor<number>,
  getHexUiData: Accessor<HexUiData>,
  getCurrentRadiant: Accessor<number>;
export declare const hotkeys: string[];

declare const _default: unknown;
export default _default;
