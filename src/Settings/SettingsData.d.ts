import { ThemeStyleConfig } from '@hope-ui/solid';
import { ThemeTokens } from '@stitches/core/types/stitches';
import Themes from '../Themes/Theme';

export default class SettingsData {
  width: number;
  borderWidth: number;
  borderStyle: string;
  borderRadius: number;
  keyboardNavigation: boolean;
  fullLayout: boolean;
  moveToCursor: boolean;
  hotkeys: string[];
  settingsBgColor: string;
  settingsAccentColor: string;
  settingsTextColor: string;
  settingsNeutralColor: string;
  hexagonSize: number;
  hexagonMargin: number;
  themes: Array<Themes>;
  currentTheme: Themes;
  newTheme: Themes;

  constructor(
    width: number,
    borderWidth: number,
    borderStyle: string,
    borderRadius: number,
    keyboardNavigation: boolean,
    fullLayout: boolean,
    moveToCursor: boolean,
    hotkeys: string[],
    settingsBgColor: string,
    settingsAccentColor: string,
    settingsTextColor: string,
    settingsNeutralColor: string,
    hexagonSize: number,
    hexagonMargin: number,
    themes: Array<Themes>,
    currentTheme: Themes,
    newTheme: Themes
  );

  getWidth(): number;
  setWidth(x: number): void;
  getBorderWidth(): number;
  setBorderWidth(x: number): void;
  getBorderStyle(): string;
  setBorderStyle(x: string): void;
  getBorderRadius(): string;
  setBorderRadius(x: number): void;
  getKeyboardNavigation(): boolean;
  setKeyboardNavigation(x: boolean): void;
  setFullLayout(x: boolean): void;
  getFullLayout(): boolean;
  setMoveToCursor(x: boolean): void;
  getMoveToCursor(): boolean;
  getHotkey(): string[];
  setHotkey(x: string[]): void;
  setSettingsBgColor(x: string): void;
  getSettingsBgColor(): string;
  setSettingsAccentColor(x: string): void;
  getSettingsAccentColor(): string;
  setSettingsTextColor(x: string): void;
  getSettingsTextColor(): string;
  setSettingsNeutralColor(x: string): void;
  getSettingsNeutralColor(): string;
  getHexagonMargin(): number;
  getHexagonSize(): number;
  setHexagonSize(x: number): void;
  setHexagonMargin(x: number): void;
  getThemes(): Array<Themes>;
  setThemes(x: Array<Themes>): void;
  getCurrentThemes(): Themes;
  setCurrentThemes(x: Themes): void;
  getNewThemes(): Themes;
  setNewThemes(x: Themes): void;

  toJSON(): {
    width: number;
    borderWidth: number;
    borderStyle: string;
    borderRadius: number;
    keyboardNavigation: boolean;
    fullLayout: boolean;
    moveToCursor: boolean;
    hotkeys: string[];
    settingsBgColor: string;
    settingsAccentColor: string;
    settingsTextColor: string;
    settingsNeutralColor: string;
    hexagonSize: number;
    hexagonMargin: number;
    currentTheme: {
      themeName: string;

      mainHexagonBg: string;
      mainHexagonIcon: string;
      mainHexagonBorder: string;
      mainHexagonRadius: string;
      mainHexagonBorderWidth: string;
      mainHexagonBorderStyle: string;

      subHexagonBg: string;
      subHexagonIcon: string;
      subHexagonBorder: string;
      subHexagonRadius: string;
      subHexagonBorderWidth: string;
      subHexagonBorderStyle: string;

      hoverHexagonBg: string;
      hoverHexagonIcon: string;
      hoverHexagonBorder: string;
      hoverHexagonRadius: string;
      hoverHexagonBorderWidth: string;
      hoverHexagonBorderStyle: string;
    };
    newTheme: {
      themeName: string;

      mainHexagonBg: string;
      mainHexagonIcon: string;
      mainHexagonBorder: string;
      mainHexagonRadius: string;
      mainHexagonBorderWidth: string;
      mainHexagonBorderStyle: string;

      subHexagonBg: string;
      subHexagonIcon: string;
      subHexagonBorder: string;
      subHexagonRadius: string;
      subHexagonBorderWidth: string;
      subHexagonBorderStyle: string;

      hoverHexagonBg: string;
      hoverHexagonIcon: string;
      hoverHexagonBorder: string;
      hoverHexagonRadius: string;
      hoverHexagonBorderWidth: string;
      hoverHexagonBorderStyle: string;
    };
    themes: Array<{
      themeName: string;

      mainHexagonBg: string;
      mainHexagonIcon: string;
      mainHexagonBorder: string;
      mainHexagonRadius: string;
      mainHexagonBorderWidth: string;
      mainHexagonBorderStyle: string;

      subHexagonBg: string;
      subHexagonIcon: string;
      subHexagonBorder: string;
      subHexagonRadius: string;
      subHexagonBorderWidth: string;
      subHexagonBorderStyle: string;

      hoverHexagonBg: string;
      hoverHexagonIcon: string;
      hoverHexagonBorder: string;
      hoverHexagonRadius: string;
      hoverHexagonBorderWidth: string;
      hoverHexagonBorderStyle: string;
    }>;
  };
  static fromJSON(data: {
    width: number;
    borderWidth: number;
    borderStyle: string;
    borderRadius: number;
    keyboardNavigation: boolean;
    fullLayout: boolean;
    moveToCursor: boolean;
    hotkeys: string[];
    settingsBgColor: string;
    settingsAccentColor: string;
    settingsTextColor: string;
    settingsNeutralColor: string;
    hexagonSize: number;
    hexagonMargin: number;
    currentTheme: {
      themeName: string;

      mainHexagonBg: string;
      mainHexagonIcon: string;
      mainHexagonBorder: string;
      mainHexagonRadius: string;
      mainHexagonBorderWidth: string;
      mainHexagonBorderStyle: string;

      subHexagonBg: string;
      subHexagonIcon: string;
      subHexagonBorder: string;
      subHexagonRadius: string;
      subHexagonBorderWidth: string;
      subHexagonBorderStyle: string;

      hoverHexagonBg: string;
      hoverHexagonIcon: string;
      hoverHexagonBorder: string;
      hoverHexagonRadius: string;
      hoverHexagonBorderWidth: string;
      hoverHexagonBorderStyle: string;
    };
    newTheme: {
      themeName: string;

      mainHexagonBg: string;
      mainHexagonIcon: string;
      mainHexagonBorder: string;
      mainHexagonRadius: string;
      mainHexagonBorderWidth: string;
      mainHexagonBorderStyle: string;

      subHexagonBg: string;
      subHexagonIcon: string;
      subHexagonBorder: string;
      subHexagonRadius: string;
      subHexagonBorderWidth: string;
      subHexagonBorderStyle: string;

      hoverHexagonBg: string;
      hoverHexagonIcon: string;
      hoverHexagonBorder: string;
      hoverHexagonRadius: string;
      hoverHexagonBorderWidth: string;
      hoverHexagonBorderStyle: string;
    };
    themes: Array<{
      themeName: string;

      mainHexagonBg: string;
      mainHexagonIcon: string;
      mainHexagonBorder: string;
      mainHexagonRadius: string;
      mainHexagonBorderWidth: string;
      mainHexagonBorderStyle: string;

      subHexagonBg: string;
      subHexagonIcon: string;
      subHexagonBorder: string;
      subHexagonRadius: string;
      subHexagonBorderWidth: string;
      subHexagonBorderStyle: string;

      hoverHexagonBg: string;
      hoverHexagonIcon: string;
      hoverHexagonBorder: string;
      hoverHexagonRadius: string;
      hoverHexagonBorderWidth: string;
      hoverHexagonBorderStyle: string;
    }>;
  }): SettingsData;
}
