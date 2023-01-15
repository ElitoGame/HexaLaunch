export default class Theme {
  private themeName = '';

  private mainHexagonBg = '';
  private mainHexagonIcon = '';
  private mainHexagonBorder = '';
  private mainHexagonRadius = '';
  private mainHexagonBorderWidth = '';
  private mainHexagonBorderStyle = '';

  private subHexagonBg = '';
  private subHexagonIcon = '';
  private subHexagonBorder = '';
  private subHexagonRadius = '';
  private subHexagonBorderWidth = '';
  private subHexagonBorderStyle = '';

  private hoverHexagonBg = '';
  private hoverHexagonIcon = '';
  private hoverHexagonBorder = '';
  private hoverHexagonRadius = '';
  private hoverHexagonBorderWidth = '';
  private hoverHexagonBorderStyle = '';

  constructor(
    themeName: string,

    mainHexagonBg: string,
    mainHexagonIcon: string,
    mainHexagonBorder: string,
    mainHexagonRadius: string,
    mainHexagonBorderWidth: string,
    mainHexagonBorderStyle: string,

    subHexagonBg: string,
    subHexagonIcon: string,
    subHexagonBorder: string,
    subHexagonRadius: string,
    subHexagonBorderWidth: string,
    subHexagonBorderStyle: string,

    hoverHexagonBg: string,
    hoverHexagonIcon: string,
    hoverHexagonBorder: string,
    hoverHexagonRadius: string,
    hoverHexagonBorderWidth: string,
    hoverHexagonBorderStyle: string
  ) {
    this.themeName = themeName;

    this.mainHexagonBg = mainHexagonBg;
    this.mainHexagonIcon = mainHexagonIcon;
    this.mainHexagonBorder = mainHexagonBorder;
    this.mainHexagonRadius = mainHexagonRadius;
    this.mainHexagonBorderWidth = mainHexagonBorderWidth;
    this.mainHexagonBorderStyle = mainHexagonBorderStyle;

    this.subHexagonBg = subHexagonBg;
    this.subHexagonIcon = subHexagonIcon;
    this.subHexagonBorder = subHexagonBorder;
    this.subHexagonRadius = subHexagonRadius;
    this.subHexagonBorderWidth = subHexagonBorderWidth;
    this.subHexagonBorderStyle = subHexagonBorderStyle;

    this.hoverHexagonBg = hoverHexagonBg;
    this.hoverHexagonIcon = hoverHexagonIcon;
    this.hoverHexagonBorder = hoverHexagonBorder;
    this.hoverHexagonRadius = hoverHexagonRadius;
    this.hoverHexagonBorderWidth = hoverHexagonBorderWidth;
    this.hoverHexagonBorderStyle = hoverHexagonBorderStyle;
  }

  public getThemeName(): string {
    return this.themeName;
  }
  public setThemeName(v: string) {
    this.themeName = v;
  }

  public getMainHexagonBg(): string {
    return this.mainHexagonBg;
  }
  public setMainHexagonBg(v: string) {
    this.mainHexagonBg = v;
  }

  public getMainHexagonIcon(): string {
    return this.mainHexagonIcon;
  }
  public setMainHexagonIcon(v: string) {
    this.mainHexagonIcon = v;
  }

  public getMainHexagonBorder(): string {
    return this.mainHexagonBorder;
  }
  public setMainHexagonBorder(v: string) {
    this.mainHexagonBorder = v;
  }

  public getMainHexagonRadius(): string {
    return this.mainHexagonRadius;
  }
  public setMainHexagonRadius(v: string) {
    this.mainHexagonRadius = v;
  }

  public getMainHexagonBorderWidth(): string {
    return this.mainHexagonBorderWidth;
  }
  public setMainHexagonBorderWidth(v: string) {
    this.mainHexagonBorderWidth = v;
  }
  public getMainHexagonBorderStyle(): string {
    return this.mainHexagonBorderStyle;
  }
  public setMainHexagonBorderStyle(v: string) {
    this.mainHexagonBorderStyle = v;
  }

  public getSubHexagonBg(): string {
    return this.subHexagonBg;
  }
  public setSubHexagonBg(v: string) {
    this.subHexagonBg = v;
  }

  public getSubHexagonIcon(): string {
    return this.subHexagonIcon;
  }
  public setSubHexagonIcon(v: string) {
    this.subHexagonIcon = v;
  }

  public getSubHexagonBorder(): string {
    return this.subHexagonBorder;
  }
  public setSubHexagonBorder(v: string) {
    this.subHexagonBorder = v;
  }

  public getSubHexagonRadius(): string {
    return this.subHexagonRadius;
  }
  public setSubHexagonRadius(v: string) {
    this.subHexagonRadius = v;
  }

  public getSubHexagonBorderWidth(): string {
    return this.subHexagonBorderWidth;
  }
  public setSubHexagonBorderWidth(v: string) {
    this.subHexagonBorderWidth = v;
  }
  public getSubHexagonBorderStyle(): string {
    return this.subHexagonBorderStyle;
  }
  public setSubHexagonBorderStyle(v: string) {
    this.subHexagonBorderStyle = v;
  }

  public getHoverHexagonBg(): string {
    return this.hoverHexagonBg;
  }
  public setHoverHexagonBg(v: string) {
    this.hoverHexagonBg = v;
  }

  public getHoverHexagonIcon(): string {
    return this.hoverHexagonIcon;
  }
  public setHoverHexagonIcon(v: string) {
    this.hoverHexagonIcon = v;
  }

  public getHoverHexagonBorder(): string {
    return this.hoverHexagonBorder;
  }
  public setHoverHexagonBorder(v: string) {
    this.hoverHexagonBorder = v;
  }

  public getHoverHexagonRadius(): string {
    return this.hoverHexagonRadius;
  }
  public setHoverHexagonRadius(v: string) {
    this.hoverHexagonRadius = v;
  }

  public getHoverHexagonBorderWidth(): string {
    return this.hoverHexagonBorderWidth;
  }
  public setHoverHexagonBorderWidth(v: string) {
    this.hoverHexagonBorderWidth = v;
  }
  public getHoverHexagonBorderStyle(): string {
    return this.hoverHexagonBorderStyle;
  }
  public setHoverHexagonBorderStyle(v: string) {
    this.hoverHexagonBorderStyle = v;
  }

  public getMainPart(): ThemePart {
    let part = new ThemePart(this, 'main');
    return part;
  }

  public getSubPart(): ThemePart {
    let part = new ThemePart(this, 'sub');
    return part;
  }

  public getHoverPart(): ThemePart {
    let part = new ThemePart(this, 'hover');
    return part;
  }

  public getPart(part: string): ThemePart {
    let themePart = new ThemePart(this, part);
    return themePart;
  }

  // Convert the Object to a JSON string

  public setDataFromObject(theme: Theme) {
    this.themeName = theme.themeName;

    this.mainHexagonBg = theme.mainHexagonBg;
    this.mainHexagonIcon = theme.mainHexagonIcon;
    this.mainHexagonBorder = theme.mainHexagonBorder;
    this.mainHexagonRadius = theme.mainHexagonRadius;
    this.mainHexagonBorderWidth = theme.mainHexagonBorderWidth;
    this.mainHexagonBorderStyle = theme.mainHexagonBorderStyle;

    this.subHexagonBg = theme.subHexagonBg;
    this.subHexagonIcon = theme.subHexagonIcon;
    this.subHexagonBorder = theme.subHexagonBorder;
    this.subHexagonRadius = theme.subHexagonRadius;
    this.subHexagonBorderWidth = theme.subHexagonBorderWidth;
    this.subHexagonBorderStyle = theme.subHexagonBorderStyle;

    this.hoverHexagonBg = theme.hoverHexagonBg;
    this.hoverHexagonIcon = theme.hoverHexagonIcon;
    this.hoverHexagonBorder = theme.hoverHexagonBorder;
    this.hoverHexagonRadius = theme.hoverHexagonRadius;
    this.hoverHexagonBorderWidth = theme.hoverHexagonBorderWidth;
    this.hoverHexagonBorderStyle = theme.hoverHexagonBorderStyle;
  }

  public toJSON(): {
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
  } {
    return {
      themeName: this.themeName,

      mainHexagonBg: this.mainHexagonBg,
      mainHexagonIcon: this.mainHexagonIcon,
      mainHexagonBorder: this.mainHexagonBorder,
      mainHexagonRadius: this.mainHexagonRadius,
      mainHexagonBorderWidth: this.mainHexagonBorderWidth,
      mainHexagonBorderStyle: this.mainHexagonBorderStyle,

      subHexagonBg: this.subHexagonBg,
      subHexagonIcon: this.subHexagonIcon,
      subHexagonBorder: this.subHexagonBorder,
      subHexagonRadius: this.subHexagonRadius,
      subHexagonBorderWidth: this.subHexagonBorderWidth,
      subHexagonBorderStyle: this.subHexagonBorderStyle,

      hoverHexagonBg: this.hoverHexagonBg,
      hoverHexagonIcon: this.hoverHexagonIcon,
      hoverHexagonBorder: this.hoverHexagonBorder,
      hoverHexagonRadius: this.hoverHexagonRadius,
      hoverHexagonBorderWidth: this.hoverHexagonBorderWidth,
      hoverHexagonBorderStyle: this.hoverHexagonBorderStyle,
    };
  }

  public static fromJSON(data: {
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
  }) {
    return new Theme(
      data.themeName,

      data.mainHexagonBg,
      data.mainHexagonIcon,
      data.mainHexagonBorder,
      data.mainHexagonRadius,
      data.mainHexagonBorderWidth,
      data.mainHexagonBorderStyle,

      data.subHexagonBg,
      data.subHexagonIcon,
      data.subHexagonBorder,
      data.subHexagonRadius,
      data.subHexagonBorderWidth,
      data.subHexagonBorderStyle,

      data.hoverHexagonBg,
      data.hoverHexagonIcon,
      data.hoverHexagonBorder,
      data.hoverHexagonRadius,
      data.hoverHexagonBorderWidth,
      data.hoverHexagonBorderStyle
    );
  }

  public clone(): Theme {
    return new Theme(
      this.themeName,

      this.mainHexagonBg,
      this.mainHexagonIcon,
      this.mainHexagonBorder,
      this.mainHexagonRadius,
      this.mainHexagonBorderWidth,
      this.mainHexagonBorderStyle,

      this.subHexagonBg,
      this.subHexagonIcon,
      this.subHexagonBorder,
      this.subHexagonRadius,
      this.subHexagonBorderWidth,
      this.subHexagonBorderStyle,

      this.hoverHexagonBg,
      this.hoverHexagonIcon,
      this.hoverHexagonBorder,
      this.hoverHexagonRadius,
      this.hoverHexagonBorderWidth,
      this.hoverHexagonBorderStyle
    );
  }
}

// create a class to access all values of just one property type: main, sub, hover depending on the constructor
export class ThemePart {
  private hexagonBg: string;
  private hexagonIcon: string;
  private hexagonBorder: string;
  private hexagonRadius: string;
  private hexagonBorderWidth: string;
  private hexagonBorderStyle: string;

  constructor(theme: Theme, part: string) {
    switch (part) {
      case 'main':
        this.hexagonBg = theme.getMainHexagonBg();
        this.hexagonIcon = theme.getMainHexagonIcon();
        this.hexagonBorder = theme.getMainHexagonBorder();
        this.hexagonRadius = theme.getMainHexagonRadius();
        this.hexagonBorderWidth = theme.getMainHexagonBorderWidth();
        this.hexagonBorderStyle = theme.getMainHexagonBorderStyle();
        break;
      case 'sub':
        this.hexagonBg = theme.getSubHexagonBg();
        this.hexagonIcon = theme.getSubHexagonIcon();
        this.hexagonBorder = theme.getSubHexagonBorder();
        this.hexagonRadius = theme.getSubHexagonRadius();
        this.hexagonBorderWidth = theme.getSubHexagonBorderWidth();
        this.hexagonBorderStyle = theme.getSubHexagonBorderStyle();
        break;
      case 'hover':
        this.hexagonBg = theme.getHoverHexagonBg();
        this.hexagonIcon = theme.getHoverHexagonIcon();
        this.hexagonBorder = theme.getHoverHexagonBorder();
        this.hexagonRadius = theme.getHoverHexagonRadius();
        this.hexagonBorderWidth = theme.getHoverHexagonBorderWidth();
        this.hexagonBorderStyle = theme.getHoverHexagonBorderStyle();
        break;
    }
  }

  public getHexagonBg(): string {
    return this.hexagonBg;
  }

  public getHexagonIcon(): string {
    return this.hexagonIcon;
  }

  public getHexagonBorder(): string {
    return this.hexagonBorder;
  }

  public getHexagonRadius(): string {
    return this.hexagonRadius;
  }

  public getHexagonBorderWidth(): string {
    return this.hexagonBorderWidth;
  }

  public getHexagonBorderStyle(): string {
    return this.hexagonBorderStyle;
  }
}
