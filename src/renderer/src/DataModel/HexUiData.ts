import HexTileData, { actionType } from './HexTileData';

export default class HexUiData {
  private tiles: Array<HexTileData> = [];
  private coreTiles: Array<HexTileData> = [];
  private radiantTile1: Array<HexTileData> = [];
  private radiantTile2: Array<HexTileData> = [];
  private radiantTile3: Array<HexTileData> = [];
  private radiantTile4: Array<HexTileData> = [];
  private radiantTile5: Array<HexTileData> = [];
  private radiantTile6: Array<HexTileData> = [];

  constructor(tiles: Array<HexTileData>) {
    this.tiles = tiles;
    this.coreTiles = tiles.filter((tile) => tile.getRadiant() === 0);
    this.radiantTile1 = tiles.filter((tile) => tile.getRadiant() === 1);
    this.radiantTile2 = tiles.filter((tile) => tile.getRadiant() === 2);
    this.radiantTile3 = tiles.filter((tile) => tile.getRadiant() === 3);
    this.radiantTile4 = tiles.filter((tile) => tile.getRadiant() === 4);
    this.radiantTile5 = tiles.filter((tile) => tile.getRadiant() === 5);
    this.radiantTile6 = tiles.filter((tile) => tile.getRadiant() === 6);
  }

  // Convert the Object to a JSON string
  public toJSON(): {
    tiles: Array<{ x: number; y: number; radiant: number; action: string; url: string }>;
  } {
    return {
      tiles: this.tiles.map((x) => x.toJSON()),
    };
  }

  public static fromJSON(data: {
    tiles: Array<{
      x: number;
      y: number;
      radiant: number;
      action: actionType;
      url: string;
    }>;
  }): HexUiData {
    return new HexUiData(
      data.tiles.map(
        (x: { x: number; y: number; radiant: number; action: actionType; url: string }) =>
          HexTileData.fromJSON(x)
      )
    );
  }

  public getCoreTiles() {
    return this.coreTiles;
  }

  public getRadiantTiles(radiant: number): Array<HexTileData> {
    switch (radiant) {
      case 1: {
        return this.radiantTile1;
      }
      case 2: {
        return this.radiantTile2;
      }
      case 3: {
        return this.radiantTile3;
      }
      case 4: {
        return this.radiantTile4;
      }
      case 5: {
        return this.radiantTile5;
      }
      case 6: {
        return this.radiantTile6;
      }
      default: {
        return this.coreTiles;
      }
    }
  }

  public getTiles() {
    return this.tiles;
  }
}
