export default class Themes {
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
    hoverHexagonBorderStyle: string
  );

  getThemeName() : string;
  setThemeName(v : string);
    
  getMainHexagonBg() : string;
  setMainHexagonBg(v : string);
  
  getMainHexagonIcon() : string;
  setMainHexagonIcon(v : string);

   getMainHexagonBorder() : string;
   setMainHexagonBorder(v : string);

   getMainHexagonRadius() : string;
   setMainHexagonRadius(v : string);

   getMainHexagonWidth() : string;
   setMainHexagonWidth(v : string);
   getMainHexagonBorderStyle() : string;
   setMainHexagonBorderStyle(v : string);


   
  
   getSubHexagonBg() : string;
   setSubHexagonBg(v : string);
  
   getSubHexagonIcon() : string;
   setSubHexagonIcon(v : string);

   getSubHexagonBorder() : string;
   setSubHexagonBorder(v : string);

   getSubHexagonRadius() : string;
   setSubHexagonRadius(v : string);

   getSubHexagonWidth() : string;
   setSubHexagonWidth(v : string);
   getSubHexagonBorderStyle() : string;
   setSubHexagonBorderStyle(v : string);



   getHoverHexagonBg() : string;
   setHoverHexagonBg(v : string);
  
   getHoverHexagonIcon() : string;
   setHoverHexagonIcon(v : string);

   getHoverHexagonBorder() : string;
   setHoverHexagonBorder(v : string);

   getHoverHexagonRadius() : string;
   setHoverexagonRadius(v : string);

   getHoverHexagonWidth() : string;
   setHoverHexagonWidth(v : string);
   getHoverHexagonBorderStyle() : string;
   setHoverHexagonBorderStyle(v : string);

  toJSON(): {
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
  fromJSON(data: {
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
  }): Themes;
}
