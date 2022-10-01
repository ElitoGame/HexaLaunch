// import fs
import { electronApp } from '@electron-toolkit/utils';
import { app } from 'electron';
import * as fs from 'fs';
import path from 'path';

export class UserSettings implements UserSettings {
  public static settings: UserSettings; // Using a Singleton here to ensure that the settings are only loaded once.
  private autoLaunch: boolean;
  public setAutoLaunch(autoLaunchVal: boolean) {
    console.log('setAutoLaunch', autoLaunchVal);
    this.autoLaunch = autoLaunchVal;
    return this;
  }
  public getAutoLaunch() {
    console.log('getAutoLaunch', this.autoLaunch);
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
    console.log('Saved user settings: ' + path.join(app.getPath('userData'), 'user-settings.json'));
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
        electronApp.setAutoLaunch(UserSettings.settings.getAutoLaunch());
      }
    }
    return UserSettings.settings;
  }
}
