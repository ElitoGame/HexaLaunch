export type actionType =
  | 'App'
  | 'Web'
  | 'PaperBin'
  | 'MediaPlayer'
  | 'SysStats'
  | 'Search'
  | 'Bookmarks'
  | 'Unset';

export default class HexTileData {
  x: number;
  y: number;
  radiant: number;
  action: actionType;
  app: string;
  url: string;

  getX(): number;
  setX(x: number): void;
  getY(): number;
  setY(y: number): void;
  getRadiant(): number;
  setRadiant(radiant: number): void;
  getAction(): string;
  setAction(action: actionType): void;
  getApp(): string;
  setApp(app: string): void;
  getUrl(): string;
  setUrl(url: string): void;
  toJSON(): { x: number; y: number; radiant: number; action: string; app: string; url: string };
  fromJSON(data: {
    x: number;
    y: number;
    radiant: number;
    action: string;
    app: string;
    url: string;
  }): HexTileData;

  constructor(x: number, y: number, radiant: number, action: actionType, app: string, url: string);
}
