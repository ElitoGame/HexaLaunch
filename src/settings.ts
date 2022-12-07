import { search, SearchResult } from '@lyrasearch/lyra';
import { createSignal } from 'solid-js';
import SettingsData from './Settings/SettingsData';
import { externalApp, externalAppManager } from './externalAppManager';
import { writeTextFile, BaseDirectory, writeFile } from '@tauri-apps/api/fs';
import { getAll } from '@tauri-apps/api/window';
import { app } from '@tauri-apps/api';
import { UserSettings } from './datastore';
import HexUiData from './DataModel/HexUiData';
import { getHexUiData, setHexUiData } from './main';
import { getHexSize, setHexSize } from './main';
import { actionType } from './DataModel/HexTileData';

const appWindow = getAll().find((w) => w.label === 'settings');
export const userSettings: UserSettings = await UserSettings.load();

export const [value, setValue] = createSignal('');

export const [getHotkeys, setHotkeys] = createSignal('');

export const [getColor, setColor] = createSignal('#FFFFFF');

export const [getRelevantApps, setRelevantApps] = createSignal<Array<externalApp>>();

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

export const [getNewTheme, setNewTheme] = createSignal(false);
export const changeWindow = () => setNewTheme(!getNewTheme());

let hotkeys: string[] = [];

appWindow.onFileDropEvent((event) => {
  if (event.payload.type === 'drop') {
    console.log('Dropped some files: ', event);
    event.payload.paths.forEach((path) => {
      externalAppManager.addCustomApp(path);
    });
  }
});

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
  //TODO clone object?
  const newHexObj = HexUiData.fromJSON(
    getHexUiData()?.toJSON() as {
      tiles: {
        x: number;
        y: number;
        radiant: number;
        action: actionType;
        app: string;
        url: string;
      }[];
    }
  );
  setHexUiData(newHexObj);
  //console.log(JSON.stringify(getSettingsData()?.toJSON()) + ' ipc');
  const temp = JSON.parse(JSON.stringify(getSettingsData()?.toJSON()));
  //console.log(temp + 'from renderer');
  //console.log(JSON.stringify(temp) + 'string from render');
  // window.electronAPI.sendData(temp);
  userSettings.setSetting(temp);
  userSettings.save();
};

export default {};
