import { listen } from '@tauri-apps/api/event';
import { Command } from '@tauri-apps/api/shell';
import { currentMonitor, getAll, LogicalPosition } from '@tauri-apps/api/window';
import { createEffect, createSignal } from 'solid-js';
import { UserSettings } from './datastore';
import {
  getCursorPosition,
  getHexMargin,
  getHexSize,
  getShowPosition,
  isHexUiVisible,
  isSearchVisible,
  setCurrentRadiant,
  setCursorPosition,
  setHexMargin,
  setHexSize,
  setIsHexUiVisible,
  setIsSearchVisible,
  setShowPosition,
} from './main';
import SettingsData from './Settings/SettingsData';

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
    x: event.payload[0] - 3,
    y: event.payload[1] + 3,
  });
  setCursorPosition({
    x: event.payload[0] - getWindowPosition().x,
    y: event.payload[1] - getWindowPosition().y,
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

export async function toggleUI(hide: boolean) {
  const body = document.querySelector('body') as HTMLElement;
  // if (await invoke('is_changing_hotkey')) return;
  if (hide) {
    console.log('hiding');
    appWindow.hide();
    body.classList.add('hidden');
    setIsHexUiVisible(false);
    setIsSearchVisible(false);
    setCurrentRadiant(-1);
  } else {
    console.log('showing');
    setTimeout(() => {
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
  }
  const args = [];

  if (app) {
    args.push(`"${app}"`);
    if (url) {
      args.push('-ArgumentList', `"${url}"`);
    }
  } else if (url) {
    args.push(`"${url}"`);
  }

  const command = new Command('open', [
    '-Command',
    app.includes('--processStart') ? '' : 'Start',
    ...args,
  ]);
  command.on('close', (data) => {
    toggleUI(true);
    console.log(`command finished with code ${data.code} and signal ${data.signal}`);
  });
  // command.on("error", (error) => console.error(`command error: "${error}"`));
  // command.stdout.on("data", (line) => console.log(`command stdout: "${line}"`));
  // command.stderr.on("data", (line) => console.log(`command stderr: "${line}"`));

  const child = await command.spawn();
  console.log('pid:', child.pid);
};
export const runAction = async (action: string, option?: string) => {
  console.log('running action', action, option);
  if (action === 'PaperBin') {
    const command = new Command('clearbin', ['-Command', 'Clear-RecycleBin', '-Force']);
    command.on('close', (data) => {
      toggleUI(true);
      console.log(`command finished with code ${data.code} and signal ${data.signal}`);
    });
    const child = await command.spawn();
    console.log('pid:', child.pid);
  }
  // window.electronAPI.runAction(action, option);
};
