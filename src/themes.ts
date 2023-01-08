import { createEffect, createSignal } from 'solid-js';
import { createStore } from 'solid-js/store';
import { getSettingsData } from './settings';
import SettingsData from './Settings/SettingsData';
import Themes from './Themes/Themes';

const dark = new Themes(
  'Dark',
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
  'Light',
  '#cacaca',
  '#343434',
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
  'Honey',
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

export const [themes, setThemes] = createStore({themes: [dark,light,honey]});


