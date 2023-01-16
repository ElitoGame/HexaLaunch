import { search } from '@lyrasearch/lyra';
import { createSignal } from 'solid-js';
import HexUiData from './DataModel/HexUiData';
import { fs, invoke } from '@tauri-apps/api';
import { externalAppManager } from './externalAppManager';
import { emit, listen } from '@tauri-apps/api/event';
import Theme from './Themes/Theme';
import { SearchResult } from '@lyrasearch/lyra/dist/methods/search';

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
  const { settings, theme } = event.payload as {
    settings: {
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
      settingsNeutralColor: string;
      settingsTextColor: string;
      hexagonSize: string;
      hexagonMargin: string;
      themes: Array<Theme>;
      currentTheme: {
        themeName: string;

        mainHexagonBg: string;
        mainHexagonIcon: string;
        mainHexagonBorder: string;
        mainHexagonRadius: string;
        mainHexagonBorderWidth: string;
        mainHexagonBorderStyle: string;

        subHexagonBg: string;
        subHexagonIcon: string;
        subHexagonBorder: string;
        subHexagonRadius: string;
        subHexagonBorderWidth: string;
        subHexagonBorderStyle: string;

        hoverHexagonBg: string;
        hoverHexagonIcon: string;
        hoverHexagonBorder: string;
        hoverHexagonRadius: string;
        hoverHexagonBorderWidth: string;
        hoverHexagonBorderStyle: string;
      };
    };
    theme: {
      themeName: string;

      mainHexagonBg: string;
      mainHexagonIcon: string;
      mainHexagonBorder: string;
      mainHexagonRadius: string;
      mainHexagonBorderWidth: string;
      mainHexagonBorderStyle: string;

      subHexagonBg: string;
      subHexagonIcon: string;
      subHexagonBorder: string;
      subHexagonRadius: string;
      subHexagonBorderWidth: string;
      subHexagonBorderStyle: string;

      hoverHexagonBg: string;
      hoverHexagonIcon: string;
      hoverHexagonBorder: string;
      hoverHexagonRadius: string;
      hoverHexagonBorderWidth: string;
      hoverHexagonBorderStyle: string;
    };
  };
  setHexMargin(parseInt(settings.hexagonMargin));
  setHexSize(parseInt(settings.hexagonSize));
  setKeyBoardNavigationEnabled(settings.keyboardNavigation);
  setFullLayout(settings.fullLayout);
  setMoveToCursor(settings.moveToCursor);

  console.log('modified settings', settings);

  document.documentElement.style.setProperty('--accent', settings.settingsAccentColor);
  document.documentElement.style.setProperty('--neutral', settings.settingsNeutralColor);
  document.documentElement.style.setProperty('--background', settings.settingsBgColor);
  document.documentElement.style.setProperty('--text', settings.settingsTextColor);
  document.documentElement.style.setProperty(
    '--mainHexagonBg',
    settings.currentTheme.mainHexagonBg
  );
  document.documentElement.style.setProperty(
    '--hoverHexagonBg',
    settings.currentTheme.hoverHexagonBg
  );
  document.documentElement.style.setProperty('--subHexagonBg', settings.currentTheme.subHexagonBg);
  document.documentElement.style.setProperty(
    '--mainHexagonBorder',
    settings.currentTheme.mainHexagonBorder
  );
  document.documentElement.style.setProperty(
    '--hoverHexagonBorder',
    settings.currentTheme.hoverHexagonBorder
  );
  document.documentElement.style.setProperty(
    '--subHexagonBorder',
    settings.currentTheme.subHexagonBorder
  );
  document.documentElement.style.setProperty(
    '--mainHexagonBorderWidth',
    theme.mainHexagonBorderWidth
  );
  document.documentElement.style.setProperty(
    '--hoverHexagonBorderWidth',
    theme.hoverHexagonBorderWidth
  );
  document.documentElement.style.setProperty(
    '--subHexagonBorderWidth',
    theme.subHexagonBorderWidth
  );
  document.documentElement.style.setProperty('--mainHexagonIcon', theme.mainHexagonIcon);
});

try {
  // check if the user-settings.json file exists
  if (await fs.exists('user-settings.json', { dir: fs.BaseDirectory.AppData })) {
    setHexUiData(
      HexUiData.fromJSON(
        JSON.parse(await fs.readTextFile('user-settings.json', { dir: fs.BaseDirectory.AppData }))
          .hexUI
      )
    );
  } else {
    // if the file does not exist, wait for the settings to be loaded,
    // so we are sure the user-settings.json file exists and has been set up correctly.
    listen('settingsLoaded', async () => {
      setHexUiData(
        HexUiData.fromJSON(
          JSON.parse(await fs.readTextFile('user-settings.json', { dir: fs.BaseDirectory.AppData }))
            .hexUI
        )
      );
      // emit the event that the UserSettings have been applied
      emit('hexUiDataLoaded');
      console.log('settings loaded', getHexUiData());
    });
  }
} catch (e) {}

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
      let result = await search(await externalAppManager.getSearchDatabase(), {
        term: query,
        properties: ['name', 'executable'],
        offset: offset,
        tolerance: 10,
        limit: 100,
      });
      // modify the result by multiplying the score by externalAppManager.getAppScore()
      //TODO: currently lyra search has a problem where the score returned might be NaN.
      // This issue has already been addressed and will be fixed in it's next release.
      // After that, in theory this code should update the result score correctly.
      result.hits.forEach(async (hit) => {
        hit.score = hit.score * externalAppManager.getAppScore(hit.document.executable);
      });
      // sort the result by score
      result.hits.sort((a, b) => b.score - a.score);
      console.log(result);
      return result;
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
  const urlPattern = new RegExp(
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
