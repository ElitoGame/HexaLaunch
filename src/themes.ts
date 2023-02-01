import { createStore } from 'solid-js/store';
import Theme from './Themes/Theme';

const dark = new Theme(
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
const light = new Theme(
  'Light',
  '#cacaca',
  '#343434',
  '',
  '',
  '3px',
  'solid',
  '#414141',
  '#343434',
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
const honey = new Theme(
  'Honey',
  '#F2B104',
  '#b34d00',
  '#F76E02',
  '',
  '3px',
  'solid',
  '#FFD66A',
  '#b34d00',
  '#F76E02',
  '',
  '3px',
  'solid',
  '#FD923E',
  '#b34d00',
  '#F76E02',
  '',
  '3px',
  'solid'
);

export const [themes, setThemes] = createStore({ themes: [dark, light, honey] });
