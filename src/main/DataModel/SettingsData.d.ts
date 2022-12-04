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
  hexagonSize: number;
  hexagonMargin: number;

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
    hexagonSize: number,
    hexagonMargin: number
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
  getHexagonSize(): number;
  setHexagonMargin(x: number): void;

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
    hexagonSize: number;
    hexagonMargin: number;
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
    hexagonSize: number;
    hexagonMargin: number;
  }): SettingsData;
}
