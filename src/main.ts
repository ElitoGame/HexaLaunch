import { search, SearchResult } from '@lyrasearch/lyra';
import { createSignal } from 'solid-js';
import HexUiData from './DataModel/HexUiData';
import { fs, invoke } from '@tauri-apps/api';
import { externalAppManager } from './externalAppManager';
import { BaseDirectory } from '@tauri-apps/api/fs';
import { listen } from '@tauri-apps/api/event';

export const [getShowPosition, setShowPosition] = createSignal({ x: 0, y: 0 });
export const [getCursorPosition, setCursorPosition] = createSignal({
  x: 0,
  y: 0,
});

export const [getHexUiData, setHexUiData] = createSignal<HexUiData>(null, { equals: false });
export const [getCurrentRadiant, setCurrentRadiant] = createSignal(-1);
export const [getHexSize, setHexSize] = createSignal(66); //66
export const [getHexMargin, setHexMargin] = createSignal(4); //4
export const [isKeyBoardNavigationEnabled, setKeyBoardNavigationEnabled] = createSignal(true);
export const [isFullLayout, setFullLayout] = createSignal(true);
export const [isMoveToCursor, setMoveToCursor] = createSignal(true);
export const [isSearchVisible, setIsSearchVisible] = createSignal(false);
export const [isHexUiVisible, setIsHexUiVisible] = createSignal(false);
export const [getCurrentMedia, setCurrentMedia] = createSignal<MediaObject>();
export const [selectedHexTile, setSelectedHexTile] = createSignal({ x: -99, y: -99 });

await listen('updateSettings', (event) => {
  const settings = event.payload as {
    width: string;
    borderWidth: string;
    borderStyle: string;
    borderRadius: string;
    keyboardNavigation: boolean;
    fullLayout: boolean;
    moveToCursor: boolean;
    hotkeys: string;
    settingsBgColor: string;
    settingsAccentColor: string;
    settingsTextColor: string;
    hexagonSize: string;
    hexagonMargin: string;
  };
  setHexMargin(parseInt(settings.hexagonMargin));
  setHexSize(parseInt(settings.hexagonSize));
  setKeyBoardNavigationEnabled(settings.keyboardNavigation);
  setFullLayout(settings.fullLayout);
  setMoveToCursor(settings.moveToCursor);
});

// value =  // for some reason, the type is not recognized, so I am doing some casting magic and it works - wooooow
setHexUiData(
  HexUiData.fromJSON(
    JSON.parse(await fs.readTextFile('user-settings.json', { dir: BaseDirectory.AppData })).hexUI
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

async function startMusicListener() {
  const unlisten = await listen<any>('mediaChanged', (event) => {
    console.log(event);
    setCurrentMedia(
      new MediaObject(event.payload[0], event.payload[2], event.payload[1], event.payload[3])
    );
  });
  const startData = await invoke('get_current_media');
  setCurrentMedia(new MediaObject(startData[0], startData[2], startData[1], startData[3]));
}

startMusicListener();

export class MediaObject {
  public title: string;
  public thumbnail: string;
  public artist: string;
  public isPlaying: boolean = false;
  constructor(title: string, thumbnail: string, artist: string, isPlaying = false) {
    this.title = title;
    this.thumbnail = thumbnail;
    this.artist = artist;
    this.isPlaying = isPlaying;
  }
}

export const isValidUrl = (urlString) => {
  var urlPattern = new RegExp(
    '^(https?:\\/\\/)?' + // validate protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // validate domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // validate OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // validate port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // validate query string
      '(\\#[-a-z\\d_]*)?$',
    'i'
  ); // validate fragment locator
  return !!urlPattern.test(urlString);
};

export default {};
