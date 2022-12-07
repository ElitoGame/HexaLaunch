import { search, SearchResult } from '@lyrasearch/lyra';
import { createEffect, createSignal } from 'solid-js';
import HexUiData from './DataModel/HexUiData';
import { fs } from '@tauri-apps/api';
import { externalAppManager, externalApp } from './externalAppManager';

export const [getShowPosition, setShowPosition] = createSignal({ x: 0, y: 0 });
export const [getCursorPosition, setCursorPosition] = createSignal({
  x: 0,
  y: 0,
});

export const [getHexUiData, setHexUiData] = createSignal<HexUiData>();
export const [getCurrentRadiant, setCurrentRadiant] = createSignal(-1);
export const [getHexSize, setHexSize] = createSignal(66); //66
export const [getHexMargin, setHexMargin] = createSignal(4); //4
export const [isSearchVisible, setIsSearchVisible] = createSignal(false);
export const [isHexUiVisible, setIsHexUiVisible] = createSignal(false);

// value =  // for some reason, the type is not recognized, so I am doing some casting magic and it works - wooooow
setHexUiData(
  HexUiData.fromJSON(
    JSON.parse(
      await fs.readTextFile(
        'C:\\Users\\ElitoGame\\AppData\\Roaming\\radialhexui\\user-settings.json'
      )
    ).hexUI
  )
);

export const searchAppDB = async (query: string, offset = 0) => {
  if (query.length == 0) {
    setSearchResults();
    return;
  }
  const result = (await searchAppDBAsync(query, offset)) as
    | SearchResult<{
        executable: 'string';
        name: 'string';
        icon: 'string';
        type: 'string';
      }>
    | undefined;
  if ((result?.count ?? 0) > 0) {
    setSearchResults(result);
  } else {
    setSearchResults();
  }
};

async function searchAppDBAsync(query: string, offset: number) {
  if (query !== undefined) {
    // test if the query start with this regex: /([a-z]:)+(\/|\\)/gi
    if (query.match(/^([a-z]:)?(\/|\\).*/gi)) {
      if (query.startsWith('/') || query.startsWith('\\')) {
        query = 'C:' + query; //TODO: get the current drive
      }
      return await externalAppManager.searchFileSystem(query, offset);
    } else {
      return search(await externalAppManager.getSearchDatabase(), {
        term: query,
        properties: ['name', 'executable'],
        offset: offset,
      });
    }
  }
  return;
  // otherwise do nothing
}

export const [getSearchResults, setSearchResults] = createSignal<
  | SearchResult<{
      executable: 'string';
      name: 'string';
      icon: 'string';
      type: 'string';
    }>
  | undefined
>();

externalAppManager.getSearchDatabase();

export default {};
