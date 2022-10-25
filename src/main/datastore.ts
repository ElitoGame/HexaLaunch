// import fs
import { electronApp, is } from '@electron-toolkit/utils';
import { app } from 'electron';
import * as fs from 'fs';
import path from 'path';
import { getHexUiWindow } from '.';
import HexTileData from './DataModel/HexTileData';
import HexUiData from './DataModel/HexUiData';

export class UserSettings implements UserSettings {
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

  private hexUI: HexUiData;

  public getHexUI(): HexUiData {
    return this.hexUI;
  }

  constructor() {
    this.autoLaunch = true;
    this.language = 'en';
    this.hexUI = new HexUiData([
      new HexTileData(0, 0, 0, 'Unset', ''),
      new HexTileData(1, 0, 1, 'Unset', ''),
      new HexTileData(2, 1, 1, 'Unset', ''),
      new HexTileData(2, 0, 1, 'Unset', ''),
      new HexTileData(2, -1, 1, 'Unset', ''),

      new HexTileData(0, 1, 0, 'Unset', ''),
      new HexTileData(0, 2, 2, 'Unset', ''),
      new HexTileData(1, 2, 2, 'Unset', ''),
      new HexTileData(1, 3, 2, 'Unset', ''),
      new HexTileData(0, 3, 2, 'Unset', ''),

      new HexTileData(-1, 1, 0, 'Unset', ''),
      new HexTileData(-2, 2, 3, 'Unset', ''),
      new HexTileData(-3, 2, 3, 'Unset', ''),
      new HexTileData(-1, 3, 3, 'Unset', ''),
      new HexTileData(-2, 3, 3, 'Unset', ''),

      new HexTileData(-2, 0, 0, 'Unset', ''),
      new HexTileData(-3, 0, 4, 'Unset', ''),
      new HexTileData(-3, 1, 4, 'Unset', ''),
      new HexTileData(-4, 0, 4, 'Unset', ''),
      new HexTileData(-3, -1, 4, 'Unset', ''),

      new HexTileData(-1, -1, 0, 'Unset', ''),
      new HexTileData(-2, -2, 5, 'Unset', ''),
      new HexTileData(-3, -2, 5, 'Unset', ''),
      new HexTileData(-2, -3, 5, 'Unset', ''),
      new HexTileData(-1, -3, 5, 'Unset', ''),

      new HexTileData(0, -1, 0, 'Unset', ''),
      new HexTileData(0, -2, 6, 'Unset', ''),
      new HexTileData(0, -3, 6, 'Unset', ''),
      new HexTileData(1, -3, 6, 'Unset', ''),
      new HexTileData(1, -2, 6, 'Unset', ''),
    ]);
  }

  public save() {
    const data = {
      autoLaunch: this.autoLaunch,
      language: this.language,
      hexUI: this.hexUI.toJSON(),
    };
    fs.writeFileSync(
      path.join(app.getPath('userData'), 'user-settings.json'),
      JSON.stringify(data)
    );
    getHexUiWindow()?.webContents.send('hexUI:getHexUiData', this.hexUI);
  }

  public static load(force = false) {
    if (UserSettings.settings === undefined || force) {
      UserSettings.settings = new UserSettings();
      try {
        const data = JSON.parse(
          fs.readFileSync(path.join(app.getPath('userData'), 'user-settings.json')).toString()
        );
        UserSettings.settings.autoLaunch = data.autoLaunch;
        UserSettings.settings.language = data.language;
        UserSettings.settings.hexUI = HexUiData.fromJSON(data.hexUI);
      } catch (e) {
        console.log('No user-settings.json found. Using default settings.');
        UserSettings.settings.save();
        // No data has been setup yet, so set default values here:
      }
      // Make sure to set the auto-launch value. This needs to happen regardless of if data is present or not,
      // because the settings file can be generated in dev mode too, but the autolaunch will never be activated in dev mode.
      if (!is.dev) {
        electronApp.setAutoLaunch(UserSettings.settings.getAutoLaunch());
      }
    }
    getHexUiWindow()?.webContents.send('hexUI:getHexUiData', UserSettings.settings.hexUI);
    // console.log(UserSettings.settings.hexUI.getCoreTiles());
    return UserSettings.settings;
  }
}
