import { SearchResult } from '@lyrasearch/lyra';
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
  getCurrentRadiant: Accessor<number>,
  isSearchVisible: Accessor<boolean>,
  setIsSearchVisible: Setter<boolean>,
  getSearchResults: Accessor<
    | SearchResult<{
        executable: 'string';
        name: 'string';
        icon: 'string';
        type: 'string';
      }>
    | undefined
  >,
  searchAppDB: (
    query: string,
    offset?: number
  ) => Promise<SearchResult<{
    executable: 'string';
    name: 'string';
    icon: 'string';
    type: 'string';
  }> | void>,
  isHexUiVisible: Accessor<boolean>;
declare const _default: unknown;
export default _default;
