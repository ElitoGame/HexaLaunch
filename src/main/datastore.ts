// import fs
import { electronApp, is } from '@electron-toolkit/utils';
import { app } from 'electron';
import * as fs from 'fs';
import path from 'path';

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

  constructor() {
    this.autoLaunch = true;
    this.language = 'en';
  }

  public save() {
    const data = {
      autoLaunch: this.autoLaunch,
      language: this.language,
    };
    fs.writeFileSync(
      path.join(app.getPath('userData'), 'user-settings.json'),
      JSON.stringify(data)
    );
  }

  public static load() {
    if (UserSettings.settings === undefined) {
      UserSettings.settings = new UserSettings();
      try {
        const data = JSON.parse(
          fs.readFileSync(path.join(app.getPath('userData'), 'user-settings.json')).toString()
        );
        UserSettings.settings.autoLaunch = data.autoLaunch;
        UserSettings.settings.language = data.language;
      } catch (e) {
        UserSettings.settings.save();
        // No data has been setup yet, so set default values here:
      }
      // Make sure to set the auto-launch value. This needs to happen regardless of if data is present or not,
      // because the settings file can be generated in dev mode too, but the autolaunch will never be activated in dev mode.
      if (!is.dev) {
        electronApp.setAutoLaunch(UserSettings.settings.getAutoLaunch());
      }
    }
    return UserSettings.settings;
  }
}
