import { Accessor, Setter } from 'solid-js';
import HexUiData from './DataModel/HexUiData';

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
declare const _default: unknown;
export default _default;
