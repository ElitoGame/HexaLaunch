import { Accessor, Setter } from 'solid-js';
import SettingsData from './Settings/SettingsData';

export declare const getSettingsData: Accessor<SettingsData>,
  setSettingsData: Setter<SettingsData>,
  getRelevantApps: () => {
    executable: string;
    name: string;
    icon: string;
  }[];

declare const _default: unknown;
export default _default;
