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

export const [change, toggleSwitch] = createSignal(true);

export const dataToSubmit = {
  width: form.width,
  borderWidth: form.borderWidth,
  radius: form.borderRadius,
  borderStyle: form.borderStyle,
  borderRadius: form.borderRadius,
  keyboardNavigation: form.keyboardNavigation,
  fullLayout: form.fullLayout,
  moveToCursor: form.moveToCursor,
};
export const updateFormField = (fieldName: string) => (event: Event) => {
  const inputElement = event.currentTarget as HTMLInputElement;
  setForm({
    [fieldName]: inputElement.value,
  });

  //TODO: border style doesnt update yet
  getSettingsData()?.setWidth(parseInt(form.width));
  getSettingsData()?.setBorderWidth(parseInt(form.borderWidth));
  getSettingsData()?.setBorderRadius(parseInt(form.borderRadius));
  getSettingsData()?.setBorderStyle(value());
  getSettingsData()?.setKeyboardNavigation(form.keyboardNavigation);
  getSettingsData()?.setFullLayout(form.fullLayout);
  getSettingsData()?.setMoveToCursor(form.moveToCursor);
  //console.log(JSON.stringify(getSettingsData()?.toJSON()) + ' ipc');
  const temp = JSON.parse(JSON.stringify(getSettingsData()?.toJSON()));
  console.log(temp + 'from renderer');
  console.log(JSON.stringify(temp) + 'string from render');
  window.electronAPI.sendData(temp);
};

export default {};
