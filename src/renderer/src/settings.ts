import { SearchResult } from '@lyrasearch/lyra';
import { createSignal } from 'solid-js';
import { createStore } from 'solid-js/store';
import SettingsData from './Settings/SettingsData';

const settings = new SettingsData(0, 0, 'solid', 0, true, true, true);
export const [value, setValue] = createSignal('');

export const [getSettingsData, setSettingsData] = createSignal(settings);

export const [form, setForm] = createStore({
  width: '',
  borderWidth: '',
  borderRadius: '',
  borderStyle: '',
  keyboardNavigation: true,
  fullLayout: true,
  moveToCursor: true,
});

export const restrictValue = (e: Event) => {
  //restrict input by minimum and maximum
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
