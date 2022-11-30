export default class SettingsData {
  private width = 0;
  private borderWidth = 0;
  private borderStyle = '';
  private borderRadius = 0;
  private keyboardNavigation = true;
  private fullLayout = true;
  private moveToCursor = true;
  private settingsBgColor = '#505050';
  private settingsTextColor = '#DFDFDF';
  private settingsAccentColor = '#5A6AFC';

  constructor(
    width: number,
    borderWidth: number,
    borderStyle: string,
    borderRadius: number,
    keyboardNavigation: boolean,
    fullLayout: boolean,
    moveToCursor: boolean
  ) {
    this.width = width;
    this.borderWidth = borderWidth;
    this.borderStyle = borderStyle;
    this.borderRadius = borderRadius;
    this.keyboardNavigation = keyboardNavigation;
    this.fullLayout = fullLayout;
    this.moveToCursor = moveToCursor;
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
  } {
    return {
      width: this.width,
      borderWidth: this.borderWidth,
      borderStyle: this.borderStyle,
      borderRadius: this.borderRadius,
      keyboardNavigation: this.keyboardNavigation,
      fullLayout: this.fullLayout,
      moveToCursor: this.moveToCursor,
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
  }) {
    return new SettingsData(
      data.width,
      data.borderWidth,
      data.borderStyle,
      data.borderRadius,
      data.keyboardNavigation,
      data.fullLayout,
      data.moveToCursor
    );
  }
}
