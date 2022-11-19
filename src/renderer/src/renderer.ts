import { SearchResult } from '@lyrasearch/lyra';
import { createSignal } from 'solid-js';
import HexUiData from './DataModel/HexUiData';

let t: NodeJS.Timeout;

export const [getShowPosition, setShowPosition] = createSignal({ x: 0, y: 0 });
export const [getHexUiData, setHexUiData] = createSignal<HexUiData>();
export const [getCurrentRadiant, setCurrentRadiant] = createSignal(-1);
export const [getHexSize, setHexSize] = createSignal(66);
export const [getHexMargin, setHexMargin] = createSignal(4);
export const [isSearchVisible, setIsSearchVisible] = createSignal(false);

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
        setIsSearchVisible(false);
      }, 1);
    } else {
      body.classList.add('hidden');
      setIsSearchVisible(false);
      setCurrentRadiant(-1);
    }
  });
  window.electronAPI.getMousePosition((_event, value) => {
    // find the max x and y values in the grid coordinates. X values in uneven rows are offset by half a hex size (0.5)
    const maxX =
      getHexUiData()
        ?.getTiles()
        .reduce(
          (max, p) =>
            p.getX() > (max ?? 0) ? (p.getY() % 2 == 0 ? p.getX() : p.getX() - 0.5) : max,
          getHexUiData()?.getTiles()[0].getX()
        ) ?? 0;
    const maxY =
      getHexUiData()
        ?.getTiles()
        .reduce(
          (max, p) => (p.getY() > (max ?? 0) ? p.getY() : max),
          getHexUiData()?.getTiles()[0].getY()
        ) ?? 0;
    const minX =
      getHexUiData()
        ?.getTiles()
        .reduce(
          (min, p) =>
            p.getX() < (min ?? 0) ? (p.getY() % 2 == 0 ? p.getX() : p.getX() + 0.5) : min,
          getHexUiData()?.getTiles()[0].getX()
        ) ?? 0;
    const minY =
      getHexUiData()
        ?.getTiles()
        .reduce(
          (min, p) => (p.getY() < (min ?? 0) ? p.getY() : min),
          getHexUiData()?.getTiles()[0].getY()
        ) ?? 0;
    // modify the x and y values so they won't cause the hex grid to be cut off
    value.x = Math.min(
      Math.max(value.x, 0 + getHexSize() / 2 + (minX + 1) * -1 * (getHexSize() + getHexMargin())),
      window.innerWidth -
        getHexSize() / 2 -
        (maxX + 1) * (getHexSize() + getHexMargin()) -
        getHexMargin()
    );
    value.y = Math.min(
      Math.max(
        value.y,
        0 +
          minY * -1 * (getHexSize() * 0.86 + getHexMargin()) +
          ((getHexSize() + getHexMargin()) / 13) * 8 +
          getHexMargin()
      ),
      window.innerHeight -
        maxY * (getHexSize() * 0.86 + getHexMargin()) -
        (getHexSize() / 13) * 8 +
        getHexMargin()
    );
    setShowPosition(value);
  });

  window.electronAPI.getHexUiData((_event, value) => {
    value = HexUiData.fromJSON(value as any); // for some reason, the type is not recognized, so I am doing some casting magic and it works - wooooow
    setHexUiData(value);
  });
};

export const openApp = (app: string, url: string) => {
  window.electronAPI.openApp(app, url);
};

export const runAction = (action: string, option?: string) => {
  window.electronAPI.runAction(action, option);
};

export const searchAppDB = async (query: string, offset = 0) => {
  if (query.length == 0) {
    setSearchResults();
    return;
  }
  const result = (await window.electronAPI.search(query, offset)) as
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

export const [getSearchResults, setSearchResults] = createSignal<
  | SearchResult<{
      executable: 'string';
      name: 'string';
      icon: 'string';
      type: 'string';
    }>
  | undefined
>();

export default {};
