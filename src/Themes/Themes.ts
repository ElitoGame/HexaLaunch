export default class Themes {
  private themeName = "";

  private mainHexagonBg = "";
  private mainHexagonIcon = "";
  private mainHexagonBorder = "";
  private mainHexagonRadius = "";
  private mainHexagonWidth = "";
  private mainHexagonBorderStyle = "";

  private subHexagonBg = "";
  private subHexagonIcon = "";
  private subHexagonBorder = "";
  private subHexagonRadius = "";
  private subHexagonWidth = "";
  private subHexagonBorderStyle = "";

  private hoverHexagonBg = "";
  private hoverHexagonIcon = "";
  private hoverHexagonBorder = "";
  private hoverHexagonRadius = "";
  private hoverHexagonWidth = "";
  private hoverHexagonBorderStyle = "";


  constructor(
  themeName: string,

  mainHexagonBg: string,
  mainHexagonIcon: string,
  mainHexagonBorder: string,
  mainHexagonRadius: string,
  mainHexagonWidth: string,
  mainHexagonBorderStyle: string,

  subHexagonBg: string,
  subHexagonIcon: string,
  subHexagonBorder: string,
  subHexagonRadius: string,
  subHexagonWidth: string,
  subHexagonBorderStyle: string,

  hoverHexagonBg: string,
  hoverHexagonIcon: string,
  hoverHexagonBorder: string,
  hoverHexagonRadius: string,
  hoverHexagonWidth: string,
  hoverHexagonBorderStyle: string,
  ) {
    this.themeName = themeName;

    this.mainHexagonBg = mainHexagonBg;
    this.mainHexagonIcon = mainHexagonIcon;
    this.mainHexagonBorder = mainHexagonBorder;
    this.mainHexagonRadius = mainHexagonRadius;
    this.mainHexagonWidth = mainHexagonWidth;
    this.mainHexagonBorderStyle = mainHexagonBorderStyle;
  
    this.subHexagonBg = subHexagonBg;
    this.subHexagonIcon = subHexagonIcon;
    this.subHexagonBorder = subHexagonBorder;
    this.subHexagonRadius = subHexagonRadius;
    this.subHexagonWidth = subHexagonWidth;
    this.subHexagonBorderStyle = subHexagonBorderStyle;
  
    this.hoverHexagonBg = hoverHexagonBg;
    this.hoverHexagonIcon = hoverHexagonIcon;
    this.hoverHexagonBorder = hoverHexagonBorder;
    this.hoverHexagonRadius = hoverHexagonRadius;
    this.hoverHexagonWidth = hoverHexagonWidth;
    this.hoverHexagonBorderStyle = hoverHexagonBorderStyle;
  }

  
   
  public getThemeName() : string {
    return this.themeName;
  }
  public setThemeName(v : string) {
    this.themeName = v;
  }
  
  
  public getMainHexagonBg() : string {
    return this.mainHexagonBg;
  }
  public setMainHexagonBg(v : string) {
    this.mainHexagonBg = v;
  }
  
  public getMainHexagonIcon() : string {
    return this.mainHexagonIcon;
  }
  public setMainHexagonIcon(v : string) {
    this.mainHexagonIcon = v;
  }

  public getMainHexagonBorder() : string {
    return this.mainHexagonBorder;
  }
  public setMainHexagonBorder(v : string) {
    this.mainHexagonBorder = v;
  }

  public getMainHexagonRadius() : string {
    return this.mainHexagonRadius;
  }
  public setMainHexagonRadius(v : string) {
    this.mainHexagonRadius = v;
  }

  public getMainHexagonWidth() : string {
    return this.mainHexagonWidth;
  }
  public setMainHexagonWidth(v : string) {
    this.mainHexagonWidth = v;
  }
  public getMainHexagonBorderStyle() : string {
    return this.mainHexagonBorderStyle;
  }
  public setMainHexagonBorderStyle(v : string) {
    this.mainHexagonBorderStyle = v;
  }


   
  
  public getSubHexagonBg() : string {
    return this.subHexagonBg;
  }
  public setSubHexagonBg(v : string) {
    this.subHexagonBg = v;
  }
  
  public getSubHexagonIcon() : string {
    return this.subHexagonIcon;
  }
  public setSubHexagonIcon(v : string) {
    this.subHexagonIcon = v;
  }

  public getSubHexagonBorder() : string {
    return this.subHexagonBorder;
  }
  public setSubHexagonBorder(v : string) {
    this.subHexagonBorder = v;
  }

  public getSubHexagonRadius() : string {
    return this.subHexagonRadius;
  }
  public setSubHexagonRadius(v : string) {
    this.subHexagonRadius = v;
  }

  public getSubHexagonWidth() : string {
    return this.subHexagonWidth;
  }
  public setSubHexagonWidth(v : string) {
    this.subHexagonWidth = v;
  }
  public getSubHexagonBorderStyle() : string {
    return this.subHexagonBorderStyle;
  }
  public setSubHexagonBorderStyle(v : string) {
    this.subHexagonBorderStyle = v;
  }



  public getHoverHexagonBg() : string {
    return this.hoverHexagonBg;
  }
  public setHoverHexagonBg(v : string) {
    this.hoverHexagonBg = v;
  }
  
  public getHoverHexagonIcon() : string {
    return this.hoverHexagonIcon;
  }
  public setHoverHexagonIcon(v : string) {
    this.hoverHexagonIcon = v;
  }

  public getHoverHexagonBorder() : string {
    return this.hoverHexagonBorder;
  }
  public setHoverHexagonBorder(v : string) {
    this.hoverHexagonBorder = v;
  }

  public getHoverHexagonRadius() : string {
    return this.hoverHexagonRadius;
  }
  public setHoverexagonRadius(v : string) {
    this.hoverHexagonRadius = v;
  }

  public getHoverHexagonWidth() : string {
    return this.hoverHexagonWidth;
  }
  public setHoverHexagonWidth(v : string) {
    this.hoverHexagonWidth = v;
  }
  public getHoverHexagonBorderStyle() : string {
    return this.hoverHexagonBorderStyle;
  }
  public setHoverHexagonBorderStyle(v : string) {
    this.hoverHexagonBorderStyle = v;
  }

  // Convert the Object to a JSON string

  public setDataFromObject(theme: Themes) {
    this.themeName = theme.themeName;

    this.mainHexagonBg = theme.mainHexagonBg;
    this.mainHexagonIcon = theme.mainHexagonIcon;
    this.mainHexagonBorder = theme.mainHexagonBorder;
    this.mainHexagonRadius = theme.mainHexagonRadius;
    this.mainHexagonWidth = theme.mainHexagonWidth;
    this.mainHexagonBorderStyle = theme.mainHexagonBorderStyle;
  
    this.subHexagonBg = theme.subHexagonBg;
    this.subHexagonIcon = theme.subHexagonIcon;
    this.subHexagonBorder = theme.subHexagonBorder;
    this.subHexagonRadius = theme.subHexagonRadius;
    this.subHexagonWidth = theme.subHexagonWidth;
    this.subHexagonBorderStyle = theme.subHexagonBorderStyle;
  
    this.hoverHexagonBg = theme.hoverHexagonBg;
    this.hoverHexagonIcon = theme.hoverHexagonIcon;
    this.hoverHexagonBorder = theme.hoverHexagonBorder;
    this.hoverHexagonRadius = theme.hoverHexagonRadius;
    this.hoverHexagonWidth = theme.hoverHexagonWidth;
    this.hoverHexagonBorderStyle = theme.hoverHexagonBorderStyle;
  }

  public toJSON(): {
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
  } {
    return {
      themeName: this.themeName,

      mainHexagonBg: this.mainHexagonBg,
      mainHexagonIcon: this.mainHexagonIcon,
      mainHexagonBorder: this.mainHexagonBorder,
      mainHexagonRadius: this.mainHexagonRadius,
      mainHexagonWidth: this.mainHexagonWidth,
      mainHexagonBorderStyle: this.mainHexagonBorderStyle,
    
      subHexagonBg: this.subHexagonBg,
      subHexagonIcon: this.subHexagonIcon,
      subHexagonBorder: this.subHexagonBorder,
      subHexagonRadius: this.subHexagonRadius,
      subHexagonWidth: this.subHexagonWidth,
      subHexagonBorderStyle: this.subHexagonBorderStyle,
    
      hoverHexagonBg: this.hoverHexagonBg,
      hoverHexagonIcon: this.hoverHexagonIcon,
      hoverHexagonBorder: this.hoverHexagonBorder,
      hoverHexagonRadius: this.hoverHexagonRadius,
      hoverHexagonWidth: this.hoverHexagonWidth,
      hoverHexagonBorderStyle: this.hoverHexagonBorderStyle,
    };
  }

  public static fromJSON(data: {
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
  }) {
    return new Themes(
      data.themeName,

  data.mainHexagonBg,
  data.mainHexagonIcon,
  data.mainHexagonBorder,
  data.mainHexagonRadius,
  data.mainHexagonWidth,
  data.mainHexagonBorderStyle,

  data.subHexagonBg,
  data.subHexagonIcon,
  data.subHexagonBorder,
  data.subHexagonRadius,
  data.subHexagonWidth,
  data.subHexagonBorderStyle,

  data.hoverHexagonBg,
  data.hoverHexagonIcon,
  data.hoverHexagonBorder,
  data.hoverHexagonRadius,
  data.hoverHexagonWidth,
  data.hoverHexagonBorderStyle,
    );
  }
}
