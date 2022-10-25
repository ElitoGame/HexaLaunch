import { createSignal } from 'solid-js';
import HexUiData from './DataModel/HexUiData';

let t: NodeJS.Timeout;

export const [getShowPosition, setShowPosition] = createSignal({ x: 0, y: 0 });
export const [getHexUiData, setHexUiData] = createSignal<HexUiData>();
export const [getCurrentRadiant, setCurrentRadiant] = createSignal(-1);
export const [getHexSize, setHexSize] = createSignal(66);
export const [getHexMargin, setHexMargin] = createSignal(4);

window.addEventListener('mousemove', (event) => {
  // Handle Window Intractable
  if (event.target === document.documentElement) {
    window.electronAPI.setIgnoreMouseEvents(true, { forward: true });
    if (t) clearTimeout(t);
    t = setTimeout(function () {
      window.electronAPI.setIgnoreMouseEvents(false, { forward: false });
    }, 150);
  } else {
    window.electronAPI.setIgnoreMouseEvents(false, { forward: false });
  }
  // Handle Hex Sector to render
  // current position
  const mx = event.clientX;
  const my = event.clientY;

  // center position
  const { x, y } = getShowPosition();

  // vector from center to mouse
  const cx = (mx - x) * -1;
  const cy = my - y;

  // distance from center to mouse
  const dist = Math.sqrt(Math.pow(cx, 2) + Math.pow(cy, 2));

  // hide the outer elements when the mouse is further away or in the center spot.
  if (
    dist < getHexSize() / 2 - getHexMargin() ||
    dist > getHexSize() / 2 + getHexMargin() * 4 + getHexSize() * 3
  ) {
    setCurrentRadiant(-1);
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

  setCurrentRadiant(sector);
});

window.onload = function (): void {
  window.electronAPI.toggleWindow((_event, value) => {
    const body = document.querySelector('body') as HTMLElement;
    if (!value) {
      setTimeout(() => {
        body.classList.remove('hidden');
      }, 1);
    } else {
      body.classList.add('hidden');
    }
  });
  window.electronAPI.getMousePosition((_event, value) => {
    setShowPosition(value);
  });
  window.electronAPI.getHexUiData((_event, value) => {
    value = HexUiData.fromJSON(value as any); // for some reason, the type is not recognized, so I am doing some casting magic and it works - wooooow
    setHexUiData(value);
  });
};

export const openApp = (url: string) => {
  window.electronAPI.openApp(url);
};

export default {};
