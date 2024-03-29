import { listen } from '@tauri-apps/api/event';
import { Command } from '@tauri-apps/api/shell';
import { currentMonitor, getAll, LogicalPosition } from '@tauri-apps/api/window';
import { createEffect, createSignal } from 'solid-js';
import HexTileData from './DataModel/HexTileData';
import { UserSettings } from './datastore';
import {
  getCurrentRadiant,
  getCursorPosition,
  getHexMargin,
  getHexSize,
  getShowPosition,
  isConfirmClearPaperBin,
  isHexUiVisible,
  isMoveToCursor,
  isSearchVisible,
  setConfirmClearPaperBin,
  setCurrentRadiant,
  setCursorPosition,
  setHexUiData,
  setIsHexUiVisible,
  setIsSearchVisible,
  setSelectedHexTile,
  setShowPosition,
} from './main';
import { getSettingsData } from './settings';
import Theme from './Themes/Theme';

/*
 █████   █████                      █████  █████ █████                                    ██████   ███          
░░███   ░░███                      ░░███  ░░███ ░░███                                    ███░░███ ░░░           
 ░███    ░███   ██████  █████ █████ ░███   ░███  ░███      ██████   ██████  ████████    ░███ ░░░  ████   ███████
 ░███████████  ███░░███░░███ ░░███  ░███   ░███  ░███     ███░░███ ███░░███░░███░░███  ███████   ░░███  ███░░███
 ░███░░░░░███ ░███████  ░░░█████░   ░███   ░███  ░███    ░███ ░░░ ░███ ░███ ░███ ░███ ░░░███░     ░███ ░███ ░███
 ░███    ░███ ░███░░░    ███░░░███  ░███   ░███  ░███    ░███  ███░███ ░███ ░███ ░███   ░███      ░███ ░███ ░███
 █████   █████░░██████  █████ █████ ░░████████   █████   ░░██████ ░░██████  ████ █████  █████     █████░░███████
░░░░░   ░░░░░  ░░░░░░  ░░░░░ ░░░░░   ░░░░░░░░   ░░░░░     ░░░░░░   ░░░░░░  ░░░░ ░░░░░  ░░░░░     ░░░░░  ░░░░░███
                                                                                                        ███ ░███
                                                                                                       ░░██████ 
                                                                                                        ░░░░░░  
*/
const maxTiles = 4;

/*
 █████   ███   █████  ███                 █████                             ██████   ██████                                                                                       █████   
░░███   ░███  ░░███  ░░░                 ░░███                             ░░██████ ██████                                                                                       ░░███    
 ░███   ░███   ░███  ████  ████████    ███████   ██████  █████ ███ █████    ░███░█████░███   ██████   ████████    ██████    ███████  ██████  █████████████    ██████  ████████   ███████  
 ░███   ░███   ░███ ░░███ ░░███░░███  ███░░███  ███░░███░░███ ░███░░███     ░███░░███ ░███  ░░░░░███ ░░███░░███  ░░░░░███  ███░░███ ███░░███░░███░░███░░███  ███░░███░░███░░███ ░░░███░   
 ░░███  █████  ███   ░███  ░███ ░███ ░███ ░███ ░███ ░███ ░███ ░███ ░███     ░███ ░░░  ░███   ███████  ░███ ░███   ███████ ░███ ░███░███████  ░███ ░███ ░███ ░███████  ░███ ░███   ░███    
  ░░░█████░█████░    ░███  ░███ ░███ ░███ ░███ ░███ ░███ ░░███████████      ░███      ░███  ███░░███  ░███ ░███  ███░░███ ░███ ░███░███░░░   ░███ ░███ ░███ ░███░░░   ░███ ░███   ░███ ███
    ░░███ ░░███      █████ ████ █████░░████████░░██████   ░░████░████       █████     █████░░████████ ████ █████░░████████░░███████░░██████  █████░███ █████░░██████  ████ █████  ░░█████ 
     ░░░   ░░░      ░░░░░ ░░░░ ░░░░░  ░░░░░░░░  ░░░░░░     ░░░░ ░░░░       ░░░░░     ░░░░░  ░░░░░░░░ ░░░░ ░░░░░  ░░░░░░░░  ░░░░░███ ░░░░░░  ░░░░░ ░░░ ░░░░░  ░░░░░░  ░░░░ ░░░░░    ░░░░░  
                                                                                                                           ███ ░███                                                       
                                                                                                                          ░░██████                                                        
                                                                                                                           ░░░░░░                                                         
*/
let monitor = await currentMonitor();
const [getWindowPosition, setWindowPosition] = createSignal({
  x: monitor.position.x,
  y: monitor.position.y,
});
const [getShowAbsolutePosition, setShowAbsolutePosition] = createSignal({
  x: 0,
  y: 0,
});

const appWindow = getAll().find((w) => w.label === 'main');

let isIgnoringEvents = false;

const unlisten = await listen('mouse_move', (event) => {
  // Handle Window Intractable
  setShowAbsolutePosition({
    x: (event.payload[0] - 3) / monitor.scaleFactor,
    y: (event.payload[1] + 3) / monitor.scaleFactor,
  });
  setCursorPosition({
    x: (event.payload[0] - getWindowPosition().x) / monitor.scaleFactor,
    y: (event.payload[1] - getWindowPosition().y) / monitor.scaleFactor,
  });
  const hoverElement = document.elementFromPoint(getCursorPosition().x, getCursorPosition().y);
  if (hoverElement === document.documentElement || hoverElement.classList.contains('root')) {
    if (!isIgnoringEvents) {
      // console.log("Ignoring Events");
      appWindow.setIgnoreCursorEvents(true);
      isIgnoringEvents = true;
    }
  } else if (isIgnoringEvents) {
    // console.log("Not Ignoring Events");
    appWindow.setIgnoreCursorEvents(false);
    isIgnoringEvents = false;
  }

  if (isHexUiVisible() && !isSearchVisible()) {
    // Handle Hex Sector to render
    // current position
    const mx = getCursorPosition().x;
    const my = getCursorPosition().y;

    // center position
    const { x, y } = getShowPosition();

    // vector from center to mouse
    const cx = (mx - x) * -1;
    const cy = my - y;

    // distance from center to mouse
    const dist = Math.sqrt(Math.pow(cx, 2) + Math.pow(cy, 2));

    // hide the outer elements when the mouse is further away or in the center spot.
    if (
      dist < getHexSize() / 2 ||
      dist > getHexSize() / 2 + getHexMargin() * (maxTiles + 1) + getHexSize() * maxTiles
    ) {
      // check if any element is hovered with the class "hexTile"
      const hoverElement = document.elementsFromPoint(getCursorPosition().x, getCursorPosition().y);
      const isHoveringHexTile = hoverElement.some((e) => {
        return e.classList.contains('hexTile');
      });
      if (!isHoveringHexTile) {
        setCurrentRadiant(-1);
      }
      // console.log(dist);
      return;
    }

    // angle from center to mouse
    const radiant = Math.atan2(cy, cx);

    // convert radiant to degrees and align it to the hex grid (30degree offset)
    const radiantDegree = radiant * (180 / Math.PI) + 180 + 30;

    // calculate the current hex sector
    let sector = Math.floor(radiantDegree / 60) + 1;
    // correct the 30degree offset, which results in 360-390degree / 60 == 7
    sector = sector == 7 ? 1 : sector;
    // console.log(sector);
    setCurrentRadiant(sector);
  }
});

appWindow.onFocusChanged(({ payload: focused }) => {
  console.log('Focus changed, window is focused? ' + focused);
  if (!focused) {
    toggleUI(true);
  }
});

await listen('toggleUI', async (event) => {
  toggleUI((event.payload as { hide: boolean }).hide);
  // invoke('print_debug');
});

let hider: NodeJS.Timeout | null = null;
let shower: NodeJS.Timeout | null = null;

export async function toggleUI(hide: boolean) {
  const body = document.querySelector('body') as HTMLElement;
  // if (await invoke('is_changing_hotkey')) return;
  if (hide) {
    console.log('hiding');
    body.classList.add('hidden');
    setIsHexUiVisible(false);
    setIsSearchVisible(false);
    setCurrentRadiant(-1);
    clearTimeout(shower);
    clearTimeout(hider);
    hider = setTimeout(() => {
      appWindow.hide();
    }, 100);
  } else {
    console.log('showing');
    clearTimeout(shower);
    clearTimeout(hider);
    shower = setTimeout(() => {
      appWindow.show();
      appWindow.setFocus();
    }, 100);
    const size = await appWindow.outerSize();
    appWindow.setPosition(
      new LogicalPosition(
        getShowAbsolutePosition().x - size.width / 2,
        getShowAbsolutePosition().y - size.height / 2
      )
    );
    monitor = await currentMonitor();
    appWindow.setSize(monitor.size);
    appWindow.setPosition(monitor.position);
    const position = monitor.position;
    console.log(
      monitor,
      await appWindow.outerSize(),
      window.innerWidth,
      window.innerHeight,
      getWindowPosition(),
      getShowAbsolutePosition(),
      getCursorPosition()
    );
    setWindowPosition({ x: position.x, y: position.y });
    setCursorPosition({
      x: getShowAbsolutePosition().x - getWindowPosition().x,
      y: getShowAbsolutePosition().y - getWindowPosition().y,
    });
    let { x, y } = getCursorPosition();
    if (!isMoveToCursor()) {
      let size = monitor.size;
      x = size.width / 2;
      y = size.height / 2;
    }
    // modify the x and y values so they won't cause the hex grid to be cut off
    x = Math.min(
      Math.max(x, 0 + getHexSize() / 2 + maxTiles * (getHexSize() + getHexMargin())),
      window.innerWidth -
        getHexSize() / 2 -
        maxTiles * (getHexSize() + getHexMargin()) -
        getHexMargin()
    );
    y = Math.min(
      Math.max(
        y,
        0 +
          maxTiles * (getHexSize() * 0.86 + getHexMargin()) +
          ((getHexSize() + getHexMargin()) / 13) * 8 +
          getHexMargin()
      ),
      window.innerHeight -
        maxTiles * (getHexSize() * 0.86 + getHexMargin()) -
        (getHexSize() / 13) * 8 +
        getHexMargin()
    );
    setShowPosition({ x, y });
    appWindow.setFocus();

    setTimeout(() => {
      body.classList.remove('hidden');
      setIsHexUiVisible(true);
      setIsSearchVisible(false);
    }, 1);
  }
}

/*
 █████  █████ █████    ██████████              █████             
░░███  ░░███ ░░███    ░░███░░░░███            ░░███              
 ░███   ░███  ░███     ░███   ░░███  ██████   ███████    ██████  
 ░███   ░███  ░███     ░███    ░███ ░░░░░███ ░░░███░    ░░░░░███ 
 ░███   ░███  ░███     ░███    ░███  ███████   ░███      ███████ 
 ░███   ░███  ░███     ░███    ███  ███░░███   ░███ ███ ███░░███ 
 ░░████████   █████    ██████████  ░░████████  ░░█████ ░░████████
  ░░░░░░░░   ░░░░░    ░░░░░░░░░░    ░░░░░░░░    ░░░░░   ░░░░░░░░ 
                                                                 
                                                                 
                                                                 
*/

export const openApp = async (app: string, url: string) => {
  console.log('opening app', app, url);

  if (app.startsWith('steam://')) {
    const command = new Command('open', ['Start', app]);
    command.on('close', (data) => {
      toggleUI(true);
      console.log(`command finished with code ${data.code} and signal ${data.signal}`);
    });
    // command.on("error", (error) => console.error(`command error: "${error}"`));
    // command.stdout.on("data", (line) => console.log(`command stdout: "${line}"`));
    // command.stderr.on("data", (line) => console.log(`command stderr: "${line}"`));

    const child = await command.spawn();
    console.log('pid:', child.pid);
  } else {
    const args = [];

    if (app) {
      args.push(`"${app}"`);
      if (url) {
        args.push('-ArgumentList', `"${url}"`);
      }
    } else if (url) {
      args.push(`"${url}"`);
    }

    const command = app.includes('--processStart')
      ? new Command('open', ['-Command', ...args.map((arg) => arg.replace(/"/g, ''))])
      : new Command('open', ['-Command', 'Start', ...args]);
    command.on('close', (data) => {
      toggleUI(true);
      console.log(`command finished with code ${data.code} and signal ${data.signal}`);
    });

    const child = await command.spawn();
    console.log('pid:', child.pid);
  }
};
let confirmClearPaperBinTimeoutReset: NodeJS.Timeout;
export const runAction = async (action: string, option?: string) => {
  console.log('running action', action, option);
  if (action === 'PaperBin') {
    if (isConfirmClearPaperBin()) {
      setConfirmClearPaperBin(false);
      clearTimeout(confirmClearPaperBinTimeoutReset);
      const command = new Command('clearbin', ['-Command', 'Clear-RecycleBin', '-Force']);
      command.on('close', (data) => {
        toggleUI(true);
        console.log(`command finished with code ${data.code} and signal ${data.signal}`);
      });
      const child = await command.spawn();
      console.log('pid:', child.pid);
    } else {
      setConfirmClearPaperBin(true);
      clearTimeout(confirmClearPaperBinTimeoutReset);
      confirmClearPaperBinTimeoutReset = setTimeout(() => {
        setConfirmClearPaperBin(false);
      }, 5000);
    }
  }
  // window.electronAPI.runAction(action, option);
};

createEffect(() => {
  if (getCurrentRadiant() === -1) {
    setSelectedHexTile({ x: -99, y: -99 });
  }
});

await listen('hexTilesChanged', (e) => {
  let dataArray = e.payload as any[];
  let hexTiles: HexTileData[] = dataArray.map((data) => {
    return HexTileData.fromJSON(data);
  });
  UserSettings.settings.getHexUI().setTiles(hexTiles);
  setHexUiData(UserSettings.settings.getHexUI());
});

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

  if (theme.themeName) {
    console.log('modified settings', settings);

    settings.themes = settings.themes.map((t) => {
      let ta = t as any;
      const theme = new Theme(
        ta.themeName,
        ta.mainHexagonBg,
        ta.mainHexagonIcon,
        ta.mainHexagonBorder,
        ta.mainHexagonRadius,
        ta.mainHexagonBorderWidth,
        ta.mainHexagonBorderStyle,

        ta.subHexagonBg,
        ta.subHexagonIcon,
        ta.subHexagonBorder,
        ta.subHexagonRadius,
        ta.subHexagonBorderWidth,
        ta.subHexagonBorderStyle,

        ta.hoverHexagonBg,
        ta.hoverHexagonIcon,
        ta.hoverHexagonBorder,
        ta.hoverHexagonRadius,
        ta.hoverHexagonBorderWidth,
        ta.hoverHexagonBorderStyle
      );
      return theme;
    });

    console.log('modified themes resulting in: ', settings.themes, theme.themeName);

    getSettingsData().setThemes(settings.themes);

    console.log('setting theme to', theme.themeName);
    getSettingsData().setCurrentTheme(
      settings.themes.find((t) => t.getThemeName() === theme.themeName)
    );
    document.documentElement.style.setProperty('--accent', settings.settingsAccentColor);
    document.documentElement.style.setProperty('--neutral', settings.settingsNeutralColor);
    document.documentElement.style.setProperty('--background', settings.settingsBgColor);
    document.documentElement.style.setProperty('--text', settings.settingsTextColor);
    document.documentElement.style.setProperty('--mainHexagonBg', theme.mainHexagonBg);
    document.documentElement.style.setProperty('--hoverHexagonBg', theme.hoverHexagonBg);
    document.documentElement.style.setProperty('--subHexagonBg', theme.subHexagonBg);
    document.documentElement.style.setProperty('--mainHexagonBorder', theme.mainHexagonBorder);
    document.documentElement.style.setProperty('--hoverHexagonBorder', theme.hoverHexagonBorder);
    document.documentElement.style.setProperty('--subHexagonBorder', theme.subHexagonBorder);
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
    document.documentElement.style.setProperty('--subHexagonIcon', theme.subHexagonIcon);
    document.documentElement.style.setProperty('--hoverHexagonIcon', theme.hoverHexagonIcon);
  }
});
