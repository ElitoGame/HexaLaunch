import { ThemeStyleConfig } from "@hope-ui/solid";
import Themes from "../Themes/Themes";

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
  themes: Themes[];

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
    themes: Themes[]
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
  getThemes(): Themes[];
  setThemes(x: Themes[]): void;

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
    themes: Themes[];
  };
  fromJSON(data: {
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
    themes: Themes[];
  }): SettingsData;
}
