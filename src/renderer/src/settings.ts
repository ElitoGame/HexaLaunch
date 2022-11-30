import { SearchResult } from '@lyrasearch/lyra';
import { createSignal } from 'solid-js';
import { createStore } from 'solid-js/store';
import SettingsData from './Settings/SettingsData';

const settings = new SettingsData(0, 0, 'solid', 0, true, true, true);
export const [value, setValue] = createSignal('');

export const [getHotkeys, setHotkeys] = createSignal('');

const color = document.getElementsByClassName('colorPick');
const themeColor = document.getElementById('theme-color');

export const [getColor, setColor] = createSignal('#FFFFFF');

export const changeColor = () => {};

export const [getSettingsData, setSettingsData] = createSignal(settings);

let hotkeys: string[] = [];
export const [form, setForm] = createStore({
  width: '',
  borderWidth: '',
  borderRadius: '',
  borderStyle: '',
  keyboardNavigation: true,
  fullLayout: true,
  moveToCursor: true,
  hotkeys: hotkeys,
  settingsBgColor: '#343434',
  settingsAccentColor: '#5A6AFC',
  settingsTextColor: '#DFDFDF',
});

export const [getNewTheme, setNewTheme] = createSignal(false);
export const changeWindow = () => setNewTheme(!getNewTheme());

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
    input.value = '';
    const temp = e.key.toString();
    setHotkeys(temp.toUpperCase());
    if (hotkeys.length == 3) {
      hotkeys = [];
    }
    hotkeys.push(temp.toUpperCase());

    input.value = hotkeys.join('+');
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
  setForm({
    [fieldName]: inputElement.value,
  });
  updateSettingData();
};

export const updateBorderStyle = (event: Event) => {
  const value = event.toString();
  console.log(value);
  setValue(value);
  updateSettingData();
};
export const updateSettingData = () => {
  getSettingsData()?.setWidth(parseInt(form.width));
  getSettingsData()?.setBorderWidth(parseInt(form.borderWidth));
  getSettingsData()?.setBorderRadius(parseInt(form.borderRadius));
  getSettingsData()?.setBorderStyle(value());
  getSettingsData()?.setKeyboardNavigation(form.keyboardNavigation);
  getSettingsData()?.setFullLayout(form.fullLayout);
  getSettingsData()?.setMoveToCursor(form.moveToCursor);
  getSettingsData()?.setMoveToCursor(form.moveToCursor);
  //console.log(JSON.stringify(getSettingsData()?.toJSON()) + ' ipc');
  const temp = JSON.parse(JSON.stringify(getSettingsData()?.toJSON()));
  //console.log(temp + 'from renderer');
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

findApps();

export default {};
