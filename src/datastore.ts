// import fs
import { fs } from '@tauri-apps/api';
import HexTileData from './DataModel/HexTileData';
import HexUiData from './DataModel/HexUiData';
import SettingsData from './Settings/SettingsData';
import { invoke } from '@tauri-apps/api/tauri';
import { setHexUiData } from './main';

export class UserSettings {
  public static settings: UserSettings; // Using a Singleton here to ensure that the settings are only loaded once.
  private autoLaunch: boolean;
  public setAutoLaunch(autoLaunchVal: boolean) {
    this.autoLaunch = autoLaunchVal;
    return this;
  }
  public getAutoLaunch() {
    return this.autoLaunch;
  }
  private language: string;

  private settingsData: SettingsData;

  private hexUI: HexUiData;

  public getHexUI(): HexUiData {
    return this.hexUI;
  }
  public getSetting(): SettingsData {
    return this.settingsData;
  }

  public setSetting(settingsData: SettingsData) {
    this.settingsData.setDataFromObject(settingsData);
  }

  constructor() {
    this.autoLaunch = true;
    this.language = 'en';
    this.settingsData = new SettingsData(
      0,
      0,
      '',
      0,
      true,
      true,
      true,
      ['STRG', 'Shift', ' '],
      '#505050',
      '#5A6AFC',
      '#DFDFDF',
      50,
      5
    );
    this.hexUI = new HexUiData([
      new HexTileData(1, 0, 0, 'Unset', '', ''),
      // new HexTileData(0, 0, 1, 'Unset', '', ''),
      new HexTileData(2, 0, 1, 'Unset', '', ''),
      new HexTileData(3, 1, 1, 'Unset', '', ''),
      new HexTileData(3, 0, 1, 'Unset', '', ''),
      new HexTileData(3, -1, 1, 'Unset', '', ''),
      new HexTileData(4, 1, 1, 'Unset', '', ''),
      new HexTileData(4, 0, 1, 'Unset', '', ''),
      new HexTileData(4, -1, 1, 'Unset', '', ''),

      new HexTileData(1, 1, 0, 'Unset', '', ''),
      // new HexTileData(0, 0, 2, 'Unset', '', ''),
      new HexTileData(1, 2, 2, 'Unset', '', ''),
      new HexTileData(2, 2, 2, 'Unset', '', ''),
      new HexTileData(2, 3, 2, 'Unset', '', ''),
      new HexTileData(1, 3, 2, 'Unset', '', ''),
      new HexTileData(2, 4, 2, 'Unset', '', ''),
      new HexTileData(3, 3, 2, 'Unset', '', ''),
      new HexTileData(1, 4, 2, 'Unset', '', ''),

      new HexTileData(0, 1, 0, 'Unset', '', ''),
      // new HexTileData(0, 0, 3, 'Unset', '', ''),
      new HexTileData(-1, 2, 3, 'Unset', '', ''),
      new HexTileData(-2, 2, 3, 'Unset', '', ''),
      new HexTileData(0, 3, 3, 'Unset', '', ''),
      new HexTileData(-1, 3, 3, 'Unset', '', ''),
      new HexTileData(-2, 4, 3, 'Unset', '', ''),
      new HexTileData(-2, 3, 3, 'Unset', '', ''),
      new HexTileData(-1, 4, 3, 'Unset', '', ''),

      new HexTileData(-1, 0, 0, 'Unset', '', ''),
      // new HexTileData(0, 0, 4, 'Unset', '', ''),
      new HexTileData(-2, 0, 4, 'Unset', '', ''),
      new HexTileData(-2, 1, 4, 'Unset', '', ''),
      new HexTileData(-3, 0, 4, 'Unset', '', ''),
      new HexTileData(-2, -1, 4, 'Unset', '', ''),
      new HexTileData(-3, 1, 4, 'Unset', '', ''),
      new HexTileData(-4, 0, 4, 'Unset', '', ''),
      new HexTileData(-3, -1, 4, 'Unset', '', ''),

      new HexTileData(0, -1, 0, 'Unset', '', ''),
      // new HexTileData(0, 0, 5, 'Unset', '', ''),
      new HexTileData(-1, -2, 5, 'Unset', '', ''),
      new HexTileData(-2, -2, 5, 'Unset', '', ''),
      new HexTileData(-1, -3, 5, 'Unset', '', ''),
      new HexTileData(0, -3, 5, 'Unset', '', ''),
      new HexTileData(-2, -4, 5, 'Unset', '', ''),
      new HexTileData(-2, -3, 5, 'Unset', '', ''),
      new HexTileData(-1, -4, 5, 'Unset', '', ''),

      new HexTileData(1, -1, 0, 'Unset', '', ''),
      // new HexTileData(0, 0, 6, 'Unset', '', ''),
      new HexTileData(1, -2, 6, 'Unset', '', ''),
      new HexTileData(1, -3, 6, 'Unset', '', ''),
      new HexTileData(2, -3, 6, 'Unset', '', ''),
      new HexTileData(2, -2, 6, 'Unset', '', ''),
      new HexTileData(2, -4, 6, 'Unset', '', ''),
      new HexTileData(3, -3, 6, 'Unset', '', ''),
      new HexTileData(1, -4, 6, 'Unset', '', ''),
    ]);
  }

  public save() {
    const data = {
      autoLaunch: this.autoLaunch,
      language: this.language,
      settingsData: this.settingsData.toJSON(),
      hexUI: this.hexUI.toJSON(),
    };
    fs.writeTextFile('user-settings.json', JSON.stringify(data), {
      dir: fs.BaseDirectory.AppConfig,
    });
    // getHexUiWindow()?.webContents.send("hexUI:getHexUiData", this.hexUI);
  }

  public static async load(force = false) {
    if (UserSettings.settings === undefined || force) {
      UserSettings.settings = new UserSettings();
      console.log('Loading settings');
      try {
        const data = JSON.parse(
          await fs.readTextFile('user-settings.json', {
            dir: fs.BaseDirectory.AppConfig,
          })
        );
        UserSettings.settings.autoLaunch = data.autoLaunch;
        UserSettings.settings.language = data.language;
        UserSettings.settings.hexUI = HexUiData.fromJSON(data.hexUI);
        UserSettings.settings.settingsData = SettingsData.fromJSON(data.settingsData);
      } catch (e) {
        console.log('No user-settings.json found. Using default settings.');
        UserSettings.settings.save();
        // No data has been setup yet, so set default values here:
      }
      // Make sure to set the auto-launch value. This needs to happen regardless of if data is present or not,
      // because the settings file can be generated in dev mode too, but the autolaunch will never be activated in dev mode.
      // TODO autoLaunch
      if (process.env.NODE_ENV !== 'development') {
        invoke('plugin:autostart|' + UserSettings.settings.autoLaunch ? 'enable' : 'disable');
      } else {
        console.log('Not setting autoLaunch in dev mode');
      }
    }
    // getHexUiWindow()?.webContents.send(
    // 	"hexUI:getHexUiData",
    // 	UserSettings.settings.hexUI
    // );
    // console.log(UserSettings.settings.hexUI.getCoreTiles());
    return UserSettings.settings;
  }

  public static setHexTileData(hexTileData: HexTileData) {
    let tileThere = UserSettings.settings
      .getHexUI()
      .getTiles()
      .find(
        (tile) =>
          tile.getX() === hexTileData.getX() &&
          tile.getY() === hexTileData.getY() &&
          tile.getRadiant() === hexTileData.getRadiant()
      );
    let index = UserSettings.settings.hexUI.getTiles().indexOf(tileThere);
    console.log(tileThere, index, hexTileData.getX(), hexTileData.getY(), hexTileData.getRadiant());
    if (index !== -1) {
      UserSettings.settings.hexUI.getTiles()[index] = hexTileData;
      UserSettings.settings.save();
      setHexUiData(UserSettings.settings.hexUI);
    }
  }
}
