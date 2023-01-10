import Themes from '../Themes/Themes';

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
  private settingsNeutralColor = '#5C5C5C';
  private hexagonSize = 50;
  private hexagonMargin = 5;
  private themes: Array<Themes> = [];
  private currentTheme: Themes = new Themes(
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
  private newTheme: Themes = new Themes(
    '',
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
    currentTheme: Themes,
    newTheme: Themes,
    themes: Array<Themes>
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
    this.settingsNeutralColor = settingsNeutralColor;
    this.hexagonSize = hexagonSize;
    this.hexagonMargin = hexagonMargin;
    this.currentTheme = currentTheme;
    this.newTheme = newTheme;
    this.themes = themes;
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

  public getSettingsNeutralColor() {
    return this.settingsNeutralColor;
  }
  public setSettingsNeutralColor(value) {
    this.settingsNeutralColor = value;
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

  public getThemes() {
    return this.themes;
  }
  public setThemes(value: Array<Themes>) {
    this.themes = value;
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

  public getCurrentTheme() {
    return this.currentTheme;
  }
  public setCurrentTheme(x: Themes) {
    this.currentTheme = x;
  }

  public getNewTheme() {
    return this.currentTheme;
  }
  public setNewTheme(x: Themes) {
    this.currentTheme = x;
  }

  // Convert the Object to a JSON string

  public setDataFromObject(settings: SettingsData) {
    this.width = settings.width;
    this.borderWidth = settings.borderWidth;
    this.borderStyle = settings.borderStyle;
    this.borderRadius = settings.borderRadius;
    this.keyboardNavigation = settings.keyboardNavigation;
    this.fullLayout = settings.fullLayout;
    this.moveToCursor = settings.moveToCursor;
    this.hotkeys = settings.hotkeys;
    this.settingsBgColor = settings.settingsBgColor;
    this.settingsAccentColor = settings.settingsAccentColor;
    this.settingsTextColor = settings.settingsTextColor;
    this.settingsNeutralColor = settings.settingsNeutralColor;
    this.hexagonSize = settings.hexagonSize;
    this.hexagonMargin = settings.hexagonMargin;
    this.themes = settings.themes;
    this.currentTheme = settings.currentTheme;
    this.newTheme = settings.newTheme;
  }

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
    settingsNeutralColor: string;
    hexagonSize: number;
    hexagonMargin: number;
    currentTheme: {
      themeName: string;

      mainHexagonBg: string;
      mainHexagonIcon: string;
      mainHexagonBorder: string;
      mainHexagonRadius: string;
      mainHexagonWidth: string;
      mainHexagonBorderStyle: string;

      subHexagonBg: string;
      subHexagonIcon: string;
      subHexagonBorder: string;
      subHexagonRadius: string;
      subHexagonWidth: string;
      subHexagonBorderStyle: string;

      hoverHexagonBg: string;
      hoverHexagonIcon: string;
      hoverHexagonBorder: string;
      hoverHexagonRadius: string;
      hoverHexagonWidth: string;
      hoverHexagonBorderStyle: string;
    };
    newTheme: {
      themeName: string;

      mainHexagonBg: string;
      mainHexagonIcon: string;
      mainHexagonBorder: string;
      mainHexagonRadius: string;
      mainHexagonWidth: string;
      mainHexagonBorderStyle: string;

      subHexagonBg: string;
      subHexagonIcon: string;
      subHexagonBorder: string;
      subHexagonRadius: string;
      subHexagonWidth: string;
      subHexagonBorderStyle: string;

      hoverHexagonBg: string;
      hoverHexagonIcon: string;
      hoverHexagonBorder: string;
      hoverHexagonRadius: string;
      hoverHexagonWidth: string;
      hoverHexagonBorderStyle: string;
    };
    themes: Array<{
      themeName: string;

      mainHexagonBg: string;
      mainHexagonIcon: string;
      mainHexagonBorder: string;
      mainHexagonRadius: string;
      mainHexagonWidth: string;
      mainHexagonBorderStyle: string;

      subHexagonBg: string;
      subHexagonIcon: string;
      subHexagonBorder: string;
      subHexagonRadius: string;
      subHexagonWidth: string;
      subHexagonBorderStyle: string;

      hoverHexagonBg: string;
      hoverHexagonIcon: string;
      hoverHexagonBorder: string;
      hoverHexagonRadius: string;
      hoverHexagonWidth: string;
      hoverHexagonBorderStyle: string;
    }>;
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
      settingsNeutralColor: this.settingsNeutralColor,
      hexagonSize: this.hexagonSize,
      hexagonMargin: this.hexagonMargin,
      newTheme: this.newTheme.toJSON(),
      currentTheme: this.currentTheme.toJSON(),
      themes: this.themes.map((x) => x.toJSON()),
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
    settingsNeutralColor: string;
    hexagonSize: number;
    hexagonMargin: number;
    currentTheme: {
      themeName: string;

      mainHexagonBg: string;
      mainHexagonIcon: string;
      mainHexagonBorder: string;
      mainHexagonRadius: string;
      mainHexagonWidth: string;
      mainHexagonBorderStyle: string;

      subHexagonBg: string;
      subHexagonIcon: string;
      subHexagonBorder: string;
      subHexagonRadius: string;
      subHexagonWidth: string;
      subHexagonBorderStyle: string;

      hoverHexagonBg: string;
      hoverHexagonIcon: string;
      hoverHexagonBorder: string;
      hoverHexagonRadius: string;
      hoverHexagonWidth: string;
      hoverHexagonBorderStyle: string;
    };
    newTheme: {
      themeName: string;

      mainHexagonBg: string;
      mainHexagonIcon: string;
      mainHexagonBorder: string;
      mainHexagonRadius: string;
      mainHexagonWidth: string;
      mainHexagonBorderStyle: string;

      subHexagonBg: string;
      subHexagonIcon: string;
      subHexagonBorder: string;
      subHexagonRadius: string;
      subHexagonWidth: string;
      subHexagonBorderStyle: string;

      hoverHexagonBg: string;
      hoverHexagonIcon: string;
      hoverHexagonBorder: string;
      hoverHexagonRadius: string;
      hoverHexagonWidth: string;
      hoverHexagonBorderStyle: string;
    };
    themes: Array<{
      themeName: string;

      mainHexagonBg: string;
      mainHexagonIcon: string;
      mainHexagonBorder: string;
      mainHexagonRadius: string;
      mainHexagonWidth: string;
      mainHexagonBorderStyle: string;

      subHexagonBg: string;
      subHexagonIcon: string;
      subHexagonBorder: string;
      subHexagonRadius: string;
      subHexagonWidth: string;
      subHexagonBorderStyle: string;

      hoverHexagonBg: string;
      hoverHexagonIcon: string;
      hoverHexagonBorder: string;
      hoverHexagonRadius: string;
      hoverHexagonWidth: string;
      hoverHexagonBorderStyle: string;
    }>;
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
      data.settingsNeutralColor,
      data.hexagonSize,
      data.hexagonMargin,
      Themes.fromJSON(data.currentTheme),
      Themes.fromJSON(data.newTheme),
      data.themes.map(
        (x: {
          themeName: string;

          mainHexagonBg: string;
          mainHexagonIcon: string;
          mainHexagonBorder: string;
          mainHexagonRadius: string;
          mainHexagonWidth: string;
          mainHexagonBorderStyle: string;

          subHexagonBg: string;
          subHexagonIcon: string;
          subHexagonBorder: string;
          subHexagonRadius: string;
          subHexagonWidth: string;
          subHexagonBorderStyle: string;

          hoverHexagonBg: string;
          hoverHexagonIcon: string;
          hoverHexagonBorder: string;
          hoverHexagonRadius: string;
          hoverHexagonWidth: string;
          hoverHexagonBorderStyle: string;
        }) => Themes.fromJSON(x)
      )
    );
  }
}
