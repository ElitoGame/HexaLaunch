import { app, BrowserWindow, ipcMain, globalShortcut, screen, Tray, Menu, shell } from 'electron';
import * as path from 'path';
import { is, electronApp } from '@electron-toolkit/utils';
import { UserSettings } from './datastore';
import open from 'open';
import getAllInstalledSoftware from 'fetch-installed-software';
import { exec } from 'node:child_process';
import fs from 'fs';
import fse from 'fs-extra';
import { readAppInfo } from 'binary-vdf';
import * as VDF from '@node-steam/vdf';
import util from 'util';
import { iconStyles } from '@hope-ui/solid';

let appVisible = false;
let tray: Tray | null = null;

let mainWindow: BrowserWindow | null = null;
let settingsWindow: BrowserWindow | null = null;

/* (Font = DOS Rebel)
   █████████                                █████                █████   █████                      █████  █████ █████                     ███                 █████                         
  ███░░░░░███                              ░░███                ░░███   ░░███                      ░░███  ░░███ ░░███                     ░░░                 ░░███                          
 ███     ░░░  ████████   ██████   ██████   ███████    ██████     ░███    ░███   ██████  █████ █████ ░███   ░███  ░███     █████ ███ █████ ████  ████████    ███████   ██████  █████ ███ █████
░███         ░░███░░███ ███░░███ ░░░░░███ ░░░███░    ███░░███    ░███████████  ███░░███░░███ ░░███  ░███   ░███  ░███    ░░███ ░███░░███ ░░███ ░░███░░███  ███░░███  ███░░███░░███ ░███░░███ 
░███          ░███ ░░░ ░███████   ███████   ░███    ░███████     ░███░░░░░███ ░███████  ░░░█████░   ░███   ░███  ░███     ░███ ░███ ░███  ░███  ░███ ░███ ░███ ░███ ░███ ░███ ░███ ░███ ░███ 
░░███     ███ ░███     ░███░░░   ███░░███   ░███ ███░███░░░      ░███    ░███ ░███░░░    ███░░░███  ░███   ░███  ░███     ░░███████████   ░███  ░███ ░███ ░███ ░███ ░███ ░███ ░░███████████  
 ░░█████████  █████    ░░██████ ░░████████  ░░█████ ░░██████     █████   █████░░██████  █████ █████ ░░████████   █████     ░░████░████    █████ ████ █████░░████████░░██████   ░░████░████   
  ░░░░░░░░░  ░░░░░      ░░░░░░   ░░░░░░░░    ░░░░░   ░░░░░░     ░░░░░   ░░░░░  ░░░░░░  ░░░░░ ░░░░░   ░░░░░░░░   ░░░░░       ░░░░ ░░░░    ░░░░░ ░░░░ ░░░░░  ░░░░░░░░  ░░░░░░     ░░░░ ░░░░                                                                                                                                                                                       
*/
function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    height: 0,
    width: 0,
    autoHideMenuBar: true,
    ...(process.platform === 'linux'
      ? {
          icon: path.join(__dirname, '../../public/icon.png'),
        }
      : {}),
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      nodeIntegration: true,
    },
    show: false,
    frame: false,
    transparent: true,
    thickFrame: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    fullscreen: false,
  });
  // The window is fullscreen anyway when in use.
  // So this reduces some issues with scrolling or clicking when the window is still overlaying everything, just invisibly.
  // We can't use hide() and show() since they play an animation with the window sliding in from the bottom.
  mainWindow.setSize(0, 0);

  // and load the index.html of the app.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.setAlwaysOnTop(true, 'pop-up-menu');
  // Open the DevTools.
  //mainWindow.webContents.openDevTools();

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    mainWindow?.webContents.send('hexUI:getHexUiData', UserSettings.settings.getHexUI());
  });

  ipcMain.on('set-ignore-mouse-events', (_event, yes: boolean, forward: { forward: boolean }) => {
    mainWindow?.setIgnoreMouseEvents(yes, forward);
  });

  mainWindow.on('close', () => {
    mainWindow = null;
  });

  mainWindow.on('blur', () => {
    toggleUI(true);
  });
}
/*
   █████████                                █████                 █████████            █████     █████     ███                                                  ███                 █████                         
  ███░░░░░███                              ░░███                 ███░░░░░███          ░░███     ░░███     ░░░                                                  ░░░                 ░░███                          
 ███     ░░░  ████████   ██████   ██████   ███████    ██████    ░███    ░░░   ██████  ███████   ███████   ████  ████████    ███████  █████     █████ ███ █████ ████  ████████    ███████   ██████  █████ ███ █████
░███         ░░███░░███ ███░░███ ░░░░░███ ░░░███░    ███░░███   ░░█████████  ███░░███░░░███░   ░░░███░   ░░███ ░░███░░███  ███░░███ ███░░     ░░███ ░███░░███ ░░███ ░░███░░███  ███░░███  ███░░███░░███ ░███░░███ 
░███          ░███ ░░░ ░███████   ███████   ░███    ░███████     ░░░░░░░░███░███████   ░███      ░███     ░███  ░███ ░███ ░███ ░███░░█████     ░███ ░███ ░███  ░███  ░███ ░███ ░███ ░███ ░███ ░███ ░███ ░███ ░███ 
░░███     ███ ░███     ░███░░░   ███░░███   ░███ ███░███░░░      ███    ░███░███░░░    ░███ ███  ░███ ███ ░███  ░███ ░███ ░███ ░███ ░░░░███    ░░███████████   ░███  ░███ ░███ ░███ ░███ ░███ ░███ ░░███████████  
 ░░█████████  █████    ░░██████ ░░████████  ░░█████ ░░██████    ░░█████████ ░░██████   ░░█████   ░░█████  █████ ████ █████░░███████ ██████      ░░████░████    █████ ████ █████░░████████░░██████   ░░████░████   
  ░░░░░░░░░  ░░░░░      ░░░░░░   ░░░░░░░░    ░░░░░   ░░░░░░      ░░░░░░░░░   ░░░░░░     ░░░░░     ░░░░░  ░░░░░ ░░░░ ░░░░░  ░░░░░███░░░░░░        ░░░░ ░░░░    ░░░░░ ░░░░ ░░░░░  ░░░░░░░░  ░░░░░░     ░░░░ ░░░░    
                                                                                                                           ███ ░███                                                                               
                                                                                                                          ░░██████                                                                                
                                                                                                                           ░░░░░░                                                                                 
*/
function createSettingsWindow(): void {
  // create the settings window
  settingsWindow = new BrowserWindow({
    height: 600,
    autoHideMenuBar: true,
    ...(process.platform === 'linux'
      ? {
          icon: path.join(__dirname, '../../public/icon.png'),
        }
      : {}),
    webPreferences: {
      preload: path.join(__dirname, '../preload/settings.js'), // Not sure if this is the correct preload script. I couldn't access the one in the SettingsMenu folder, so hoping this one is enough.
      nodeIntegration: true,
    },
    width: 800,
    title: 'RadialHexUI Settings',
    icon: path.join(__dirname, '../../public/icon.png'),
  });

  // and load the settings.html of the app.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    console.log('Loading settings from', process.env['ELECTRON_RENDERER_URL']);
    settingsWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] + '/settings.html');
  } else {
    settingsWindow.loadFile(path.join(__dirname, '../renderer/settings.html'));
  }
  // Open the DevTools.
  //mainWindow.webContents.openDevTools();

  settingsWindow.once('ready-to-show', () => {
    settingsWindow?.show();
  });

  settingsWindow.on('close', () => {
    settingsWindow = null;
  });

  ipcMain.on('settings', (event, arg) => {
    const settingsObj = JSON.parse(JSON.stringify(arg));
    UserSettings.settings.setSetting(settingsObj);
    UserSettings.settings.save();
    //console.log(JSON.stringify(arg) + 'from Main');
    //console.log(UserSettings.settings.getSetting());
  });
}

app.disableHardwareAcceleration();

/*
    ███████                  ███████████                          █████           
  ███░░░░░███               ░░███░░░░░███                        ░░███            
 ███     ░░███ ████████      ░███    ░███   ██████   ██████    ███████  █████ ████
░███      ░███░░███░░███     ░██████████   ███░░███ ░░░░░███  ███░░███ ░░███ ░███ 
░███      ░███ ░███ ░███     ░███░░░░░███ ░███████   ███████ ░███ ░███  ░███ ░███ 
░░███     ███  ░███ ░███     ░███    ░███ ░███░░░   ███░░███ ░███ ░███  ░███ ░███ 
 ░░░███████░   ████ █████    █████   █████░░██████ ░░████████░░████████ ░░███████ 
   ░░░░░░░    ░░░░ ░░░░░    ░░░░░   ░░░░░  ░░░░░░   ░░░░░░░░  ░░░░░░░░   ░░░░░███ 
                                                                         ███ ░███ 
                                                                        ░░██████  
                                                                         ░░░░░░   
*/
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
  /* (font = Cybermedium)
    ____ _  _ ____ ____ ___ ____ _  _ ___ ____ 
    [__  |__| |  | |__/  |  |    |  |  |  [__  
    ___] |  | |__| |  \  |  |___ |__|  |  ___] 
  */
  // Register a 'CommandOrControl+Shift+Space' shortcut listener.
  globalShortcut.register('CommandOrControl+Shift+Space', () => {
    toggleUI();
  });
  //TODO Remove the reload shortcut in production!
  globalShortcut.register('CommandOrControl+R', () => {
    UserSettings.load(true);
  });

  // Get Apps from the uninstall registry
  globalShortcut.register('CommandOrControl+1', () => {
    console.log('CommandOrControl+1 is pressed');
    console.log(queryUninstallApps());
  });

  // Get currently running apps.
  globalShortcut.register('CommandOrControl+2', async () => {
    console.log('CommandOrControl+2 is pressed');
    //TODO test if this works for all users!
    console.log(queryRunningApps());
  });

  // Get Apps based on the start menu links.
  globalShortcut.register('CommandOrControl+3', async () => {
    console.log('CommandOrControl+3 is pressed');
    console.log(queryStartMenuLinkedApps());
  });

  // Get Apps from the Epic Games Launcher and Steam
  globalShortcut.register('CommandOrControl+4', async () => {
    console.log('CommandOrControl+4 is pressed');
    console.log(queryEpicGames());
    console.log(querySteamGames());
  });

  // Get Apps from the Epic Games Launcher and Steam
  globalShortcut.register('CommandOrControl+5', async () => {
    console.log('CommandOrControl+5 is pressed');
    const total: Set<string> = new Set<string>();
    console.time('Total');

    const uninstall = await queryUninstallApps();
    console.log('Uninstall');
    console.timeLog('Total');
    const running = await queryRunningApps();
    console.log('Running');
    console.timeLog('Total');
    const startMenu = await queryStartMenuLinkedApps();
    console.log('StartMenu');
    console.timeLog('Total');
    const epic = await queryEpicGames();
    console.log('Epic');
    console.timeLog('Total');
    const steam = await querySteamGames();
    console.log('Steam');
    console.timeLog('Total');

    uninstall.forEach((value) => total.add(value));
    running.forEach((value) => total.add(value));
    startMenu.forEach((value) => total.add(value));
    epic.forEach((value) => total.add(value));
    steam.forEach((value) => total.add(value));

    console.log(total.size);
    console.timeEnd('Total');
  });

  /*
    ___ ____ ____ _   _ ____ 
     |  |__/ |__|  \_/  [__  
     |  |  \ |  |   |   ___] 
  */
  const settings: UserSettings = UserSettings.load(); // Load the user settings
  tray = new Tray(path.join(__dirname, '../../public/icon.ico'));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open Settings',
      type: 'normal',
      click: () => (settingsWindow === null ? createSettingsWindow() : settingsWindow.focus()),
    },
    {
      label: 'Toggle AutoLaunch',
      type: 'checkbox',
      checked: settings.getAutoLaunch(),
      enabled: !is.dev,
      click: () => {
        settings.setAutoLaunch(!settings.getAutoLaunch()).save();
        electronApp.setAutoLaunch(settings.getAutoLaunch());
      },
    },
    { label: 'Close UI', type: 'normal', click: () => app.quit() },
  ]);
  tray.setContextMenu(contextMenu);
  tray.setToolTip('Radial Hex UI');

  /*
    _ ___  ____ _  _ ____ _ _  _    _  _ ____ _  _ ___  _    ____ ____ 
    | |__] |    |\/| |__| | |\ |    |__| |__| |\ | |  \ |    |___ [__  
    | |    |___ |  | |  | | | \|    |  | |  | | \| |__/ |___ |___ ___] 
  */
  ipcMain.handle('hexUI:openApp', openApp);
});

/*
    ██████                ███   █████     ██                 █████████  ████                           
  ███░░░░███             ░░░   ░░███     ███                ███░░░░░███░░███                           
 ███    ░░███ █████ ████ ████  ███████  ░░░  ████████      ███     ░░░  ░███   ██████   █████   ██████ 
░███     ░███░░███ ░███ ░░███ ░░░███░       ░░███░░███    ░███          ░███  ███░░███ ███░░   ███░░███
░███   ██░███ ░███ ░███  ░███   ░███         ░███ ░███    ░███          ░███ ░███ ░███░░█████ ░███████ 
░░███ ░░████  ░███ ░███  ░███   ░███ ███     ░███ ░███    ░░███     ███ ░███ ░███ ░███ ░░░░███░███░░░  
 ░░░██████░██ ░░████████ █████  ░░█████      ████ █████    ░░█████████  █████░░██████  ██████ ░░██████ 
   ░░░░░░ ░░   ░░░░░░░░ ░░░░░    ░░░░░      ░░░░ ░░░░░      ░░░░░░░░░  ░░░░░  ░░░░░░  ░░░░░░   ░░░░░░  
*/
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  // Unregister a shortcut.
  globalShortcut.unregister('CommandOrControl+Shift+Space');

  // Unregister all shortcuts.
  globalShortcut.unregisterAll();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

/*
  ███                     ██████   ██████   █████████    ███                █████                               █████ ████                  
 ░░░                     ░░██████ ██████   ███░░░░░███  ░░░                ░░███                               ░░███ ░░███                  
 ████  ████████   ██████  ░███░█████░███  ░███    ░███  ████  ████████      ░███████    ██████   ████████    ███████  ░███   ██████   █████ 
░░███ ░░███░░███ ███░░███ ░███░░███ ░███  ░███████████ ░░███ ░░███░░███     ░███░░███  ░░░░░███ ░░███░░███  ███░░███  ░███  ███░░███ ███░░  
 ░███  ░███ ░███░███ ░░░  ░███ ░░░  ░███  ░███░░░░░███  ░███  ░███ ░███     ░███ ░███   ███████  ░███ ░███ ░███ ░███  ░███ ░███████ ░░█████ 
 ░███  ░███ ░███░███  ███ ░███      ░███  ░███    ░███  ░███  ░███ ░███     ░███ ░███  ███░░███  ░███ ░███ ░███ ░███  ░███ ░███░░░   ░░░░███
 █████ ░███████ ░░██████  █████     █████ █████   █████ █████ ████ █████    ████ █████░░████████ ████ █████░░████████ █████░░██████  ██████ 
░░░░░  ░███░░░   ░░░░░░  ░░░░░     ░░░░░ ░░░░░   ░░░░░ ░░░░░ ░░░░ ░░░░░    ░░░░ ░░░░░  ░░░░░░░░ ░░░░ ░░░░░  ░░░░░░░░ ░░░░░  ░░░░░░  ░░░░░░  
       ░███                                                                                                                                 
       █████                                                                                                                                
      ░░░░░                                                                                                                                 
*/

function openApp(_event: Electron.IpcMainInvokeEvent, app: string, url: string) {
  if (app !== undefined && url !== undefined) {
    open(url, { app: { name: app } });
  } else if (app !== undefined) {
    open(app);
  } else if (url !== undefined) {
    open(url);
  }
  // otherwise do nothing
}

/*
 █████  █████  █████     ███  ████   ███   █████     ███                  
░░███  ░░███  ░░███     ░░░  ░░███  ░░░   ░░███     ░░░                   
 ░███   ░███  ███████   ████  ░███  ████  ███████   ████   ██████   █████ 
 ░███   ░███ ░░░███░   ░░███  ░███ ░░███ ░░░███░   ░░███  ███░░███ ███░░  
 ░███   ░███   ░███     ░███  ░███  ░███   ░███     ░███ ░███████ ░░█████ 
 ░███   ░███   ░███ ███ ░███  ░███  ░███   ░███ ███ ░███ ░███░░░   ░░░░███
 ░░████████    ░░█████  █████ █████ █████  ░░█████  █████░░██████  ██████ 
  ░░░░░░░░      ░░░░░  ░░░░░ ░░░░░ ░░░░░    ░░░░░  ░░░░░  ░░░░░░  ░░░░░░  
*/
/**
 * Toggle/set the visibility of the main hex UI window
 * @param visible If true, will hide the window. If false, will show the window. Defaults to a toggle based on the current visibility (appVisible)
 */
function toggleUI(visible = appVisible) {
  // If called and appVisible is currently false, then the window will be shown.
  // Set it to fullscreen so that the window is maximized and the menu can be moved via CSS later.
  if (!visible) {
    mainWindow?.setPosition(screen.getCursorScreenPoint().x, screen.getCursorScreenPoint().y);
    mainWindow?.setFullScreen(true);
    mainWindow?.focus();
  } else {
    mainWindow?.setFullScreen(false); // Set the window to it's default size of 0,0 so it won't interfere with any user interaction.
  }
  mainWindow?.webContents.send('toggle-window', visible);
  const pos = {
    x: screen.getCursorScreenPoint().x - (mainWindow?.getPosition()[0] ?? 0),
    y: screen.getCursorScreenPoint().y - (mainWindow?.getPosition()[1] ?? 0),
  };
  mainWindow?.webContents.send('set-mouse-position', pos);
  console.log('CommandOrControl+Shift+Space is pressed, now: ' + visible);
  appVisible = !visible;
  // mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
}

export function getHexUiWindow() {
  return mainWindow;
}

async function queryUninstallApps() {
  const data = await getAllInstalledSoftware.getAllInstalledSoftware();
  const collectedApps = (data as Array<any>)
    .filter(
      (x) =>
        x.DisplayName !== undefined &&
        x.DisplayIcon !== undefined &&
        x.DisplayIcon !== '' &&
        x.InstallLocation !== undefined &&
        x.InstallLocation !== '' &&
        (x.DisplayIcon as string).includes('.exe') &&
        !(x.DisplayIcon as string).includes('%SYSTEMROOT%') &&
        !(x.DisplayName as string).includes('Win') &&
        !(x.DisplayName as string).includes('Microsoft') &&
        !(x.DisplayName as string).toLowerCase().includes('uninstall') &&
        (!(x.InstallLocation as string)?.toLowerCase().includes('uninstall') ?? true) &&
        (!(x.DisplayIcon as string)?.toLowerCase().includes('uninstall') ?? true)
    )
    .map((x) => {
      return (x.DisplayIcon.split('.exe')[0] + '.exe').replace(/"/g, '');
      // return { name: x.DisplayName, path: x.InstallLocation, icon: x.DisplayIcon };
    });
  // // use this to write the results to a file
  // writeFileSync(
  //   'C:\\Users\\ElitoGame\\Documents\\GitHub\\RadialHexUI\\installedSoftware.json',
  //   JSON.stringify(files)
  // );
  return collectedApps;
}

async function queryRunningApps() {
  //TODO: Find a way to promisify this without "Access is denied" errors. The callback is difficult to handle as I can't await it.
  const collectedApps: Array<string> = await new Promise((resolve) => {
    exec(
      'Get-Process | Where-Object {$_.MainWindowTitle -ne ""} | Select-Object -Expand MainModule | Select-Object -Property FileName',
      { shell: 'powershell.exe' },
      (_err, stout) => {
        resolve(
          stout
            .split('\n')
            .slice(3, -1)
            .map((x) => x.trim())
            .filter((x) => x !== '')
        );
      }
    );
  });
  return collectedApps;
}

async function queryStartMenuLinkedApps() {
  const execProm = util.promisify(exec);
  let collectedApps: Array<string> = [];
  const { stdout } = await execProm(
    'where /r "C:\\ProgramData\\Microsoft\\Windows\\Start Menu" *.lnk'
  );
  stdout.split(/(\r\n|\n|\r)/gm).map((x) => {
    try {
      collectedApps.push(shell.readShortcutLink(x).target);
    } catch (error) {
      return x;
    }
  });
  // Filter our unlikely results. (.urls, installers, uninstallers, etc.)
  collectedApps = collectedApps.filter(
    (x) =>
      x !== undefined &&
      x.endsWith('.exe') &&
      !x.includes('uninstall') &&
      !x.includes('setup') &&
      !x.includes('install') &&
      !x.includes('repair') &&
      !x.includes('update') &&
      !x.includes('upgrade') &&
      !x.includes('unins001') &&
      !x.includes('unins000')
  );
  return collectedApps;
}

async function querySteamGames() {
  const inBuffer = await fse.createReadStream(
    'C:\\Program Files (x86)\\Steam\\appcache\\appinfo.vdf'
  );
  const appInfo = await readAppInfo(inBuffer);
  const collectedApps: Array<string> = await new Promise((resolve) => {
    const collectedSteamGames: Array<string> = [];
    fs.readFile(
      'C:\\Program Files (x86)\\Steam\\steamapps\\libraryfolders.vdf',
      'utf8',
      (err, data) => {
        try {
          if (err) return;
          const parsed = VDF.parse(data);
          // console.log(parsed);
          for (const key in parsed.libraryfolders) {
            // console.log(parsed.libraryfolders[key].apps);
            for (const app in parsed.libraryfolders[key].apps) {
              const gameData = appInfo.filter((x) => x.id === Number.parseInt(app))[0];
              if (gameData.entries.common.name === 'Steamworks Common Redistributables') continue;
              const firstLaunchEntry = Object.keys(gameData.entries.config.launch)[0];
              collectedSteamGames.push(
                parsed.libraryfolders[key].path +
                  '\\steamapps\\common\\' +
                  gameData.entries.config.installdir +
                  '\\' +
                  gameData.entries.config.launch[firstLaunchEntry]?.executable
              );
            }
          }
          resolve(collectedSteamGames);
        } catch (error) {
          console.log(error);
        }
      }
    );
  });
  return collectedApps;
}

async function queryEpicGames() {
  const collectedApps: Array<string> = await new Promise((resolve) => {
    const collectedEpicGames: Array<string> = [];
    fs.readdir('C:\\ProgramData\\Epic\\EpicGamesLauncher\\Data\\Manifests', async (err, data) => {
      if (err) return;
      for (const file of data) {
        await new Promise<void>((resolve) => {
          fs.readFile(
            `C:\\ProgramData\\Epic\\EpicGamesLauncher\\Data\\Manifests\\${file}`,
            'utf8',
            (err, data) => {
              if (err) {
                resolve();
                return;
              }
              const parsed = JSON.parse(data);
              if (fs.existsSync(parsed.InstallLocation + '\\' + parsed.LaunchExecutable)) {
                collectedEpicGames.push(parsed.InstallLocation + '\\' + parsed.LaunchExecutable);
              }
              resolve();
            }
          );
        });
      }
      resolve(collectedEpicGames);
    });
  });
  return collectedApps;
}
