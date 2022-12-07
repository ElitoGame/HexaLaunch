import HexTileData, { actionType } from './HexTileData';

export default class HexUiData {
  toJSON: () => {
    hexTiles: {
      tiles: Array<{
        x: number;
        y: number;
        radiant: number;
        action: string;
        app: string;
        url: string;
      }>;
    };
  };
  static fromJSON: (data: {
    tiles: Array<{
      x: number;
      y: number;
      radiant: number;
      action: actionType;
      app: string;
      url: string;
    }>;
  }) => HexUiData;
  getCoreTiles: () => Array<HexTileData>;
  getRadiantTiles: (radiant: number) => Array<HexTileData>;
  getTiles: () => Array<HexTileData>;

  constructor(tiles: Array<HexTileData>);
}
