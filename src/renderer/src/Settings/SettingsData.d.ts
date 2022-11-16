export default class SettingsData {
  width: number;
  borderWidth: number;
  borderStyle: string;
  borderRadius: number;
  keyboardNavigation: boolean;
  fullLayout: boolean;
  moveToCursor: boolean;

  constructor(
    width: number,
    borderWidth: number,
    borderStyle: string,
    borderRadius: number,
    keyboardNavigation: boolean,
    fullLayout: boolean,
    moveToCursor: boolean
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

  toJSON(): {
    width: number;
    borderWidth: number;
    borderStyle: string;
    borderRadius: number;
    keyboardNavigation: boolean;
    fullLayout: boolean;
    moveToCursor: boolean;
  };
  fromJSON(data: {
    width: number;
    borderWidth: number;
    borderStyle: string;
    borderRadius: number;
    keyboardNavigation: boolean;
    fullLayout: boolean;
    moveToCursor: boolean;
  }): SettingsData;
}
