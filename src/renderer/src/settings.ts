import { SearchResult } from '@lyrasearch/lyra';
import { createSignal } from 'solid-js';
import SettingsData from './Settings/SettingsData';
import HexUiData from './DataModel/HexUiData';
import { getHexUiData, setHexUiData } from './renderer';
import { getHexSize, setHexSize } from './renderer';

export const [value, setValue] = createSignal('');

export const [getHotkeys, setHotkeys] = createSignal('');

export const [getColor, setColor] = createSignal('#FFFFFF');

export const changeColor = () => {};
const init = new SettingsData(
  1,
  1,
  'solid',
  1,
  true,
  true,
  true,
  ['STRG', 'SHIFT', ' '],
  '#343434',
  '#5A6AFC',
  '#DFDFDF',
  50,
  4
);
export const [getSettingsData, setSettingsData] = createSignal<SettingsData>(init, {
  equals: false,
});

export const [getCurrentTab, setCurrentTab] = createSignal('Appearance');
//export const [getHexUiData, setHexUiData] = createSignal<HexUiData>();
//export const [getHexSize, setHexSize] = createSignal(80);

export const [getShowPosition, setShowPosition] = createSignal({ x: 50, y: 50 });
export const [getCurrentRadiant, setCurrentRadiant] = createSignal(-1);
export const [getHexMargin, setHexMargin] = createSignal(4);
export const [isSearchVisible, setIsSearchVisible] = createSignal(true);
export const [isHexUiVisible, setIsHexUiVisible] = createSignal(true);
export const [getNewTheme, setNewTheme] = createSignal(false);
export const changeWindow = () => setNewTheme(!getNewTheme());

let hotkeys: string[] = [];

export function handleHotkeyEvent(e) {
  e.preventDefault();
  const input = e.currentTarget as HTMLInputElement;
  if (e.keyCode === 46) {
    //delete hotkeys when delete is pressed
    input.value = '';
    hotkeys = [];
  } else if (e.keyCode === 8) {
    //delete last hotkey when backspace is pressed
    hotkeys.pop();
    input.value = hotkeys.join('+');
  } else {
    let temp = '';
    if (e.keyCode === 32) {
      input.value = '';
      temp = 'SPACE';
    } else {
      input.value = '';
      temp = e.key.toString();
    }
    setHotkeys(temp.toUpperCase());
    if (hotkeys.length == 3) {
      hotkeys = [];
    }
    hotkeys.push(temp.toUpperCase());

    input.value = hotkeys.join('+');
  }

  getSettingsData()?.setHotkeys(hotkeys);
  updateSettingData();
}
//restrict input by minimum and maximum
export const restrictValue = (e: Event) => {
  const input = e.currentTarget as HTMLInputElement;
  const max = parseInt(input.max);
  const min = parseInt(input.min);

  if (parseInt(input.value) >= max) {
    input.value = max.toString();
  }
  if (parseInt(input.value) <= min) {
    input.value = min.toString();
  }

  // replace special characters
  let a = input.value;
  a = a.replace(/[^a-zA-Z0-9]/g, '');
  input.value = a;
};

export const updateFormField = (fieldName: string) => (event: Event) => {
  const inputElement = event.currentTarget as HTMLInputElement;
  getSettingsData()?.setSettingsBgColor(inputElement.value);
  // setForm({
  //   [fieldName]: inputElement.value,
  // });
  console.log(fieldName, inputElement.value);
};

export const updateBorderStyle = (event: Event) => {
  const value = event.toString();
  setValue(value);
  updateSettingData();
};

export const updateSettingData = () => {
  // console.log(getHexSize());
  console.log(JSON.stringify(getSettingsData()) + 'from update');
  //assign new objects for rerendering
  const newObj = SettingsData.fromJSON(getSettingsData().toJSON());
  setSettingsData(newObj);

  // setHexSize(getSettingsData()!.getHexagonSize());
  const newHexObj = HexUiData.fromJSON(getHexUiData()!.toJSON());
  setHexUiData(newHexObj);

  const temp = JSON.parse(JSON.stringify(getSettingsData()?.toJSON()));
  // console.log(temp + 'from renderer');
  //console.log(JSON.stringify(temp) + 'string from render');
  window.electronAPI.sendData(temp);
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

export const addApp = async (app: string) => {
  return await window.electronAPI.addApp(app);
};

export const [getRelevantApps, setRelevantApps] = createSignal<
  Array<{
    executable: 'string';
    name: 'string';
    icon: 'string';
    type: 'string';
  }>
>();

const findApps = async () => {
  console.log('searching Apps');
  setRelevantApps((await window.electronAPI.getRelevantApps()) ?? []);
};

window.electronAPI.getHexUiData((_event, value) => {
  value = HexUiData.fromJSON(value as any);
  setHexUiData(value);
  //console.log(value);
});

findApps();

window.electronAPI.getSettingsData((_event, value) => {
  value = SettingsData.fromJSON(value as any);
  setSettingsData(value);
  document.documentElement.style.setProperty(
    '--accent',
    getSettingsData()?.getSettingsAccentColor()
  );
  document.documentElement.style.setProperty(
    '--background',
    getSettingsData()?.getSettingsBgColor()
  );
  document.documentElement.style.setProperty('--text', getSettingsData()?.getSettingsTextColor());
  //setHexSize(getSettingsData()!.getHexagonSize());
});

let t: NodeJS.Timeout;

export const openApp = (app: string, url: string) => {
  window.electronAPI.openApp(app, url);
};

export const runAction = (action: string, option?: string) => {
  window.electronAPI.runAction(action, option);
};

export default {};
