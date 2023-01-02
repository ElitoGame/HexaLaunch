import { createEffect, createSignal } from 'solid-js';
import SettingsData from './Settings/SettingsData';
import Themes from './Themes/Themes';

const dark = new Themes(
  'dark',
  '#414141',
  '#DFDFDF',
  '',
  '',
  '3px',
  'solid',
  '#414141',
  '#DFDFDF',
  '',
  '',
  '3px',
  'solid',
  '#31247B',
  '#DFDFDF',
  '',
  '',
  '3px',
  'solid'
);
const light = new Themes(
  'light',
  '#cacaca',
  '#DFDFDF',
  '',
  '',
  '3px',
  'solid',
  '#414141',
  '#DFDFDF',
  '',
  '',
  '3px',
  'solid',
  '#5A6AFC',
  '#DFDFDF',
  '',
  '',
  '3px',
  'solid'
);
const honey = new Themes(
  'honey',
  '#F2B104',
  '#F76E02',
  '#F76E02',
  '',
  '3px',
  'solid',
  '#FFD66A',
  '#F76E02',
  '#F76E02',
  '',
  '3px',
  'solid',
  '#FD923E',
  '#F76E02',
  '#F76E02',
  '',
  '3px',
  'solid'
);

export let themes = [dark, honey, light];
export const [theme, setTheme] = createSignal(themes[0]);

export default {};
