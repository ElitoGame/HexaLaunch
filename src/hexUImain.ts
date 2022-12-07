import { fs } from '@tauri-apps/api';
import { listen } from '@tauri-apps/api/event';
import { register, isRegistered, unregister } from '@tauri-apps/api/globalShortcut';
import { Command } from '@tauri-apps/api/shell';
import { currentMonitor, getAll, LogicalPosition } from '@tauri-apps/api/window';
import { createSignal } from 'solid-js';
import HexUiData from './DataModel/HexUiData';
import {
  getCursorPosition,
  getHexMargin,
  getHexSize,
  getShowPosition,
  isHexUiVisible,
  setCurrentRadiant,
  setCursorPosition,
  setHexUiData,
  setIsHexUiVisible,
  setIsSearchVisible,
  setShowPosition,
} from './main';

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

await unregister('CommandOrControl+Shift+Space');
if (!(await isRegistered('CommandOrControl+Shift+Space'))) {
  await register('CommandOrControl+Shift+Space', async () => {
    console.log('Shortcut triggered');
    toggleUI(await appWindow.isVisible());
  });
}

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

  if (isHexUiVisible()) {
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

export async function toggleUI(hide: boolean) {
  const body = document.querySelector('body') as HTMLElement;
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
    const position = monitor.position;
    console.log(monitor);
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
    appWindow.setFullscreen(true);
    appWindow.setFocus();

    setTimeout(() => {
      body.classList.remove('hidden');
      setIsHexUiVisible(true);
      setIsSearchVisible(false);
    }, 1);
  }
}

appWindow.onCloseRequested(async () => {
  await unregister('CmdOrControl+Shift+Space');
});

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

  const command = new Command('open', ['-Command', 'Start', ...args]);
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
