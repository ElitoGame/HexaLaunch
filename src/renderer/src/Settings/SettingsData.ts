export default class SettingsData {
  private width = 0;
  private borderWidth = 0;
  private borderStyle = '';
  private borderRadius = 0;
  private keyboardNavigation = true;
  private fullLayout = true;
  private moveToCursor = true;
  private hotkeys = ['STRG', 'Shift', ' '];
  private settingsBgColor = '#343434';
  private settingsAccentColor = '#5A6AFC';
  private settingsTextColor = '#DFDFDF';
  private hexagonSize = 50;
  private hexagonMargin = 5;

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
  ) {
    this.width = width;
    this.borderWidth = borderWidth;
    this.borderStyle = borderStyle;
    this.borderRadius = borderRadius;
    this.keyboardNavigation = keyboardNavigation;
    this.fullLayout = fullLayout;
    this.moveToCursor = moveToCursor;
    this.hotkeys = hotkeys;
    this.settingsBgColor = settingsBgColor;
    this.settingsAccentColor = settingsAccentColor;
    this.settingsTextColor = settingsTextColor;
    this.hexagonSize = hexagonSize;
    this.hexagonMargin = hexagonMargin;
  }

  public getHexagonMargin() {
    return this.hexagonMargin;
  }
  public setHexagonMargin(value) {
    this.hexagonMargin = value;
  }
  public getHexagonSize() {
    return this.hexagonSize;
  }
  public setHexagonSize(value) {
    this.hexagonSize = value;
  }
  public getSettingsTextColor() {
    return this.settingsTextColor;
  }
  public setSettingsTextColor(value) {
    this.settingsTextColor = value;
  }

  public getSettingsAccentColor() {
    return this.settingsAccentColor;
  }
  public setSettingsAccentColor(value) {
    this.settingsAccentColor = value;
  }

  public getSettingsBgColor() {
    return this.settingsBgColor;
  }
  public setSettingsBgColor(value) {
    this.settingsBgColor = value;
  }
  public getHotkeys() {
    return this.hotkeys;
  }
  public setHotkeys(value: string[]) {
    this.hotkeys = value;
  }
  public getWidth() {
    return this.width;
  }
  public setWidth(x: number) {
    this.width = x;
  }

  public getBorderWidth() {
    return this.borderWidth;
  }
  public setBorderWidth(x: number) {
    this.borderWidth = x;
  }
  public getBorderStyle() {
    return this.borderStyle;
  }
  public setBorderStyle(x: string) {
    this.borderStyle = x;
  }
  public getBorderRadius() {
    return this.borderRadius;
  }
  public setBorderRadius(x: number) {
    this.borderRadius = x;
  }

  public getKeyboardNavigation() {
    return this.keyboardNavigation;
  }
  public setKeyboardNavigation(x: boolean) {
    this.keyboardNavigation = x;
  }

  public getFullLayout() {
    return this.fullLayout;
  }
  public setFullLayout(x: boolean) {
    this.fullLayout = x;
  }

  public getMoveToCursor() {
    return this.moveToCursor;
  }
  public setMoveToCursor(x: boolean) {
    this.moveToCursor = x;
  }
  // Convert the Object to a JSON string

  public toJSON(): {
    width: number;
    borderWidth: number;
    borderStyle: string;
    borderRadius: number;
    keyboardNavigation: boolean;
    fullLayout: boolean;
    moveToCursor: boolean;
    hotkeys: Array<string>;
    settingsBgColor: string;
    settingsAccentColor: string;
    settingsTextColor: string;
    hexagonSize: number;
    hexagonMargin: number;
  } {
    return {
      width: this.width,
      borderWidth: this.borderWidth,
      borderStyle: this.borderStyle,
      borderRadius: this.borderRadius,
      keyboardNavigation: this.keyboardNavigation,
      fullLayout: this.fullLayout,
      moveToCursor: this.moveToCursor,
      hotkeys: this.hotkeys,
      settingsBgColor: this.settingsBgColor,
      settingsAccentColor: this.settingsAccentColor,
      settingsTextColor: this.settingsTextColor,
      hexagonSize: this.hexagonSize,
      hexagonMargin: this.hexagonMargin,
    };
  }

  public static fromJSON(data: {
    width: number;
    borderWidth: number;
    borderStyle: string;
    borderRadius: number;
    keyboardNavigation: boolean;
    fullLayout: boolean;
    moveToCursor: boolean;
    hotkeys: Array<string>;
    settingsBgColor: string;
    settingsAccentColor: string;
    settingsTextColor: string;
    hexagonSize: number;
    hexagonMargin: number;
  }) {
    return new SettingsData(
      data.width,
      data.borderWidth,
      data.borderStyle,
      data.borderRadius,
      data.keyboardNavigation,
      data.fullLayout,
      data.moveToCursor,
      data.hotkeys,
      data.settingsBgColor,
      data.settingsAccentColor,
      data.settingsTextColor,
      data.hexagonSize,
      data.hexagonMargin
    );
  }
}
