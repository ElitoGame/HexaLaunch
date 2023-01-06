import { createEffect, createSignal } from 'solid-js';
import SettingsData from './Settings/SettingsData';
import { externalApp, externalAppManager } from './externalAppManager';
import { getAll } from '@tauri-apps/api/window';
import { window } from '@tauri-apps/api';
import { UserSettings } from './datastore';
import HexUiData from './DataModel/HexUiData';
import {
  getHexMargin,
  getHexSize,
  getHexUiData,
  setHexMargin,
  setHexSize,
  setHexUiData,
} from './main';
import { actionType } from './DataModel/HexTileData';
import { unregister, isRegistered, register } from '@tauri-apps/api/globalShortcut';
import { emit, listen } from '@tauri-apps/api/event';
import { themes, setTheme, theme } from './themes';
import Themes from './Themes/Themes';
import { newThemes, setNewThemes } from './Settings/newThemeTab';

const appWindow = getAll().find((w) => w.label === 'settings');
export const userSettings: UserSettings = await UserSettings.load();

export const [value, setValue] = createSignal('');

export const [getHotkeys, setHotkeys] = createSignal('');

export const [getColor, setColor] = createSignal('#FFFFFF');

export const [getRelevantApps, setRelevantApps] = createSignal<Array<externalApp>>();
export const [getAllApps, setAllApps] = createSignal<Array<externalApp>>();

export const [isDraggingTiles, setIsDraggingTiles] = createSignal<boolean>(false);
export const [wasDraggingTiles, setWassDraggingTiles] = createSignal<boolean>(false);
export const [useMainHexagonInput, setUseMainHexagonInput] = createSignal<boolean>(false);

let dragChangerTimeout: NodeJS.Timeout;
createEffect(() => {
  if (!isDraggingTiles()) {
    dragChangerTimeout = setTimeout(() => {
      setWassDraggingTiles(false);
    }, 100);
  } else {
    clearTimeout(dragChangerTimeout);
    setWassDraggingTiles(true);
  }
});

export const changeColor = () => {};

console.log(userSettings);

export const [getSettingsData, setSettingsData] = createSignal<SettingsData>(
  userSettings.getSetting(),
  {
    equals: false,
  }
);

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
    // ignore if already pressed
    if (hotkeys.includes(e.key.toString().toUpperCase())) {
      return;
    }
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
    // bring SHIFT to front
    if (hotkeys.includes('SHIFT')) {
      hotkeys.splice(hotkeys.indexOf('SHIFT'), 1);
      hotkeys.unshift('SHIFT');
    }
    // bring ALT to front
    if (hotkeys.includes('ALT')) {
      hotkeys.splice(hotkeys.indexOf('ALT'), 1);
      hotkeys.unshift('ALT');
    }
    // bring CONTrol to front
    if (hotkeys.includes('CONTROL')) {
      hotkeys.splice(hotkeys.indexOf('CONTROL'), 1);
      hotkeys.unshift('CONTROL');
    }

    if (hotkeys.length == 3) {
      // must contain at least 2 modifier keys and 1 key
      if (hotkeys[0] == 'SHIFT' || hotkeys[0] == 'ALT' || hotkeys[0] == 'CONTROL') {
        if (hotkeys[1] == 'SHIFT' || hotkeys[1] == 'ALT' || hotkeys[1] == 'CONTROL') {
          if (hotkeys[2] != 'SHIFT' && hotkeys[2] != 'ALT' && hotkeys[2] != 'CONTROL') {
            // all good
          } else {
            hotkeys.pop();
          }
        } else {
          hotkeys.pop();
        }
      }
    }
    if (hotkeys.length == 2) {
      // hotkey 1 must be a modifier key and hotkey 2 must be a key
      if (hotkeys[0] == 'SHIFT' || hotkeys[0] == 'ALT' || hotkeys[0] == 'CONTROL') {
        if (hotkeys[1] != 'SHIFT' && hotkeys[1] != 'ALT' && hotkeys[1] != 'CONTROL') {
          // all good
        } else {
          hotkeys.pop();
        }
      }
    }

    input.value = hotkeys.join('+');
  }
  if (hotkeys.length != 0) {
    getSettingsData()?.setHotkeys(hotkeys);
    updateSettingData();
  }
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
  // console.log(JSON.stringify(getSettingsData()) + 'from update');
  //assign new objects for rerendering
  
  const newObj = SettingsData.fromJSON(getSettingsData().toJSON());
  newObj.setThemes(themes.themes);
  const newTheme = Themes.fromJSON(newThemes().toJSON());
  setNewThemes(newTheme);
 
  setSettingsData(newObj);
  registerShortCut(newObj.getHotkeys().join('+'));



  const temp = JSON.parse(JSON.stringify(getSettingsData()?.toJSON()));

  userSettings.setSetting(temp);
  userSettings.save();

  // setHexSize(getSettingsData()!.getHexagonSize());
  //TODO clone object?
  // try catch to avoid an error in the hexUI window
  // that somehow getHexUiData() is not initialized yet...
  try {
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
  } catch (e) {
    // console.error(e);
  }

  console.log(userSettings.getSetting());
  emit('updateSettings', { settings: userSettings.getSetting(), theme: theme() });
};

let oldShortcut = getSettingsData()?.getHotkeys().join('+') ?? 'Control+Shift+Space';
const mainWindow = window.getAll().find((w) => w.label === 'main');

async function registerShortCut(shortcut: string) {
  try {
    await unregister(oldShortcut);
    oldShortcut = shortcut;
    if (!(await isRegistered(shortcut))) {
      await register(shortcut, async () => {
        const currentVisibility = await mainWindow?.isVisible();
        emit('toggleUI', {
          hide: currentVisibility,
        });
      });
    }
    appWindow.onCloseRequested(async () => {
      await unregister(shortcut);
    });
  } catch (error) {}
}

updateSettingData();
registerShortCut(userSettings.getSetting().getHotkeys().join('+'));

export default {};
