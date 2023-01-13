// import fs
import { fs } from '@tauri-apps/api';
import HexTileData from './DataModel/HexTileData';
import HexUiData from './DataModel/HexUiData';
import SettingsData from './Settings/SettingsData';
import { invoke } from '@tauri-apps/api/tauri';
import { setHexUiData } from './main';
import { emit } from '@tauri-apps/api/event';
import Theme from './Themes/Theme';

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

    const darkTheme = new Theme(
      'Dark',
      '#414141',
      '#DFDFDF',
      '#000000',
      '0',
      '10',
      'none',
      '#414141',
      '#DFDFDF',
      '#000000',
      '0',
      '10',
      'none',
      '#31247B',
      '#DFDFDF',
      '#000000',
      '0',
      '10',
      'none'
    );

    this.settingsData = new SettingsData(
      0,
      0,
      '',
      0,
      true,
      true,
      true,
      ['CONTROL', 'SHIFT', 'SPACE'],
      '#343434',
      '#5A6AFC',
      '#DFDFDF',
      '#5C5C5C',
      66,
      4,
      darkTheme,
      darkTheme,
      [
        darkTheme,
        new Theme(
          'Light',
          '#cacaca',
          '#343434',
          '#000000',
          '0',
          '10',
          'none',
          '#A2D6E1',
          '#DFDFDF',
          '#000000',
          '0',
          '10',
          'none',
          '#2DC6D0',
          '#DFDFDF',
          '#000000',
          '0',
          '10',
          'none'
        ),
        new Theme(
          'Honey',
          '#F2B104',
          '#F76E02',
          '#F76E02',
          '0',
          '10',
          'solid',
          '#FFD66A',
          '#F76E02',
          '#F76E02',
          '0',
          '10',
          'solid',
          '#FD923E',
          '#F76E02',
          '#F76E02',
          '0',
          '10',
          'solid'
        ),
      ]
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

  public async save() {
    this.hexUI.setTiles(
      this.hexUI.getTiles().sort((a, b) => {
        if (a.getRadiant() < b.getRadiant()) {
          return -1;
        } else if (a.getRadiant() > b.getRadiant()) {
          return 1;
        }
        return 0;
      })
    );
    const data = {
      autoLaunch: this.autoLaunch,
      language: this.language,
      settingsData: this.settingsData.toJSON(),
      hexUI: this.hexUI.toJSON(),
    };

    if (!(await fs.exists('', { dir: fs.BaseDirectory.AppData }))) {
      await fs.createDir('', { dir: fs.BaseDirectory.AppData });
    }
    // check if the file exists and if the changes are actually changes
    if (
      (await fs.exists('user-settings.json', { dir: fs.BaseDirectory.AppData })) &&
      JSON.stringify(data) ===
        JSON.stringify(
          JSON.parse(await fs.readTextFile('user-settings.json', { dir: fs.BaseDirectory.AppData }))
        )
    ) {
      console.log('No changes to settings');
    } else {
      await fs.writeTextFile('user-settings.json', JSON.stringify(data), {
        dir: fs.BaseDirectory.AppData,
      });
      console.log('Settings saved');
    }
    // getHexUiWindow()?.webContents.send("hexUI:getHexUiData", this.hexUI);
  }

  public static async load(force = false) {
    if (UserSettings.settings === undefined || force) {
      UserSettings.settings = new UserSettings();
      console.log('Loading settings');
      if (!(await fs.exists('user-settings.json', { dir: fs.BaseDirectory.AppData }))) {
        // No data has been setup yet, so set default values here:
        console.log('No user-settings.json found. Using default settings.');
        UserSettings.settings.save();
        invoke('plugin:autostart|enable');
      }
      try {
        const data = JSON.parse(
          await fs.readTextFile('user-settings.json', {
            dir: fs.BaseDirectory.AppData,
          })
        );
        UserSettings.settings.autoLaunch = data.autoLaunch;
        UserSettings.settings.language = data.language;
        UserSettings.settings.hexUI = HexUiData.fromJSON(data.hexUI);
        UserSettings.settings.settingsData = SettingsData.fromJSON(data.settingsData);
      } catch (e) {}
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
    emit('settingsLoaded');
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

  public static setHexTileDataArray(hexTileDataArray: HexTileData[]) {
    UserSettings.settings.hexUI.setTiles(hexTileDataArray);
    UserSettings.settings.save();
    setHexUiData(UserSettings.settings.hexUI);
  }
}
