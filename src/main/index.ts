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
import os from 'os';

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

  ipcMain.on('settings', (_event, arg) => {
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
  globalShortcut.register('CommandOrControl+1', async () => {
    console.log('CommandOrControl+1 is pressed');
    console.log(await queryUninstallApps());
  });

  // Get currently running apps.
  globalShortcut.register('CommandOrControl+2', async () => {
    console.log('CommandOrControl+2 is pressed');
    //TODO test if this works for all users!
    console.log(await queryRunningApps());
  });

  // Get Apps based on the start menu links.
  globalShortcut.register('CommandOrControl+3', async () => {
    console.log('CommandOrControl+3 is pressed');
    console.log(await queryStartMenuLinkedApps());
  });

  // Get Apps from the Epic Games Launcher and Steam
  globalShortcut.register('CommandOrControl+4', async () => {
    console.log('CommandOrControl+4 is pressed');
    console.log(await queryEpicGames());
    console.log(await querySteamGames());
  });

  // Get Apps from the Epic Games Launcher and Steam
  globalShortcut.register('CommandOrControl+5', async () => {
    console.log('CommandOrControl+5 is pressed');
    let total: Array<string> = [];
    console.time('Total');

    const uninstall = await queryUninstallApps();
    console.log('Uninstall: ' + uninstall.length);
    console.timeLog('Total');
    const running = await queryRunningApps();
    console.log('Running: ' + running.length);
    console.timeLog('Total');
    const startMenu = await queryStartMenuLinkedApps();
    console.log('StartMenu: ' + startMenu.length);
    console.timeLog('Total');
    const programFiles = await queryProgramFilesApps();
    console.log('ProgramFiles: ' + programFiles.length);
    console.timeLog('Total');
    const desktop = await queryDesktopApps();
    console.log('Desktop: ' + desktop.length);
    console.timeLog('Total');

    uninstall.forEach((value) => total.push(value));
    running.forEach((value) => total.push(value));
    startMenu.forEach((value) => total.push(value));
    programFiles.forEach((value) => total.push(value));
    desktop.forEach((value) => total.push(value));

    total = total.map((value) => {
      return value.replace(/(\\|\\\\|\\\/)/g, '\\');
    });

    console.log('Collecting unique values...');
    // unique
    total = total.filter((value, index, self) => self.indexOf(value) === index);
    console.log('Total before existing check: ' + total.length);
    total = total.filter((value) => fs.existsSync(value) && !value.includes('['));
    console.log('Total after existing check: ' + total.length);

    console.log(total.length);
    console.timeLog('Total');
    console.log("Querying Name's...");
    // get-childitem "C:\Users\ElitoGame\AppData\Local\Programs\Microsoft VS Code\Code.exe" | % {$_.VersionInfo} | Select ProductName
    const originalPaths = total.join('","');
    // split the paths into chunks of roughly 30000 characters but definitely at the delimiter ",", so that the command doesn't exceed the maximum length of 32000 characters or similar.
    const paths = originalPaths.match(/.{1,30000}(?=","|$)/g) ?? [];
    const nameVersionPromises: Array<Promise<string>> = [];

    let names: Array<string> = [];
    for (const path of paths) {
      nameVersionPromises.push(
        new Promise<string>((resolve) => {
          //
          exec(
            // (get-childitem "C:\Users\ElitoGame\AppData\Local\Programs\Microsoft VS Code\Code.exe", "C:\Users\ElitoGame\AppData\Local\Programs\signal-desktop\Signal.exe" | % {$_.VersionInfo} | Where-Object {$_.ProductName -ne "" -and $_.ProductVersion -ne ""} | Select ProductName, ProductVersion | ForEach-Object { '"{0}":"{1}"' -f $_.ProductName, $_.ProductVersion }) -join ','
            //  | Where-Object {$_.ProductName -and $_.ProductVersion}
            `(get-childitem ${('"' + path + '"').replace(
              '"",',
              ''
            )} | % {$_.VersionInfo} | Select ProductName, ProductVersion | ForEach-Object { '{{"{0}":"{1}"}}' -f $_.ProductName, $_.ProductVersion }) -join ','`,
            { shell: 'powershell.exe' },
            (_err, stout) => {
              try {
                resolve(stout.trim());
                if (_err) {
                  console.log(_err);
                }
              } catch (error) {
                console.error(error);
                resolve('{"":""}');
              }
            }
          );
        })
      );
    }
    names = await Promise.all(nameVersionPromises);
    console.log('Queried names & versions, combining...');
    console.timeLog('Total');
    const nameVersionArray = JSON.parse('[' + names.join(',') + ']');

    const finalData: Array<{ executable: string; name: string; icon?: string; version?: string }> =
      [];

    for (let i = 0; i < total.length; i++) {
      if (
        nameVersionArray[i] === undefined ||
        Object.keys(nameVersionArray[i])[0] === '' ||
        (Object.values(nameVersionArray[i])[0] as string) === ''
      ) {
        continue;
      }
      const executable = total[i];
      const name = Object.keys(nameVersionArray[i])[0];
      const version = Object.values(nameVersionArray[i])[0] as string;
      const icon = undefined;
      finalData.push({ executable, name, icon, version });
    }

    //The Epic and Steam games often have unreadable names, so we need to query them after the other apps. This however means they won't have a version number.
    const epic = await queryEpicGames();
    console.log('Epic: ' + epic.length);
    console.timeLog('Total');
    const steam = await querySteamGames();
    console.log('Steam: ' + steam.length);
    console.timeLog('Total');
    epic.forEach(
      (value) =>
        // if the executable is already in the list, replace it with the new one.
        finalData.some((value2, index) => {
          if (value2.executable === value.executable) {
            finalData[index] = value;
            return true;
          }
          return false;
        }) ||
        finalData.push({
          executable: value.executable,
          name: value.name,
          icon: undefined,
          version: undefined,
        })
    );
    steam.forEach(
      (value) =>
        finalData.some((value2, index) => {
          if (value2.executable === value.executable) {
            finalData[index] = value;
            return true;
          }
          return false;
        }) ||
        finalData.push({
          executable: value.executable,
          name: value.name,
          icon: undefined,
          version: undefined,
        })
    );

    console.log("Querying Icon's...");

    const iconPromises: Array<Promise<string | undefined>> = [];
    finalData.forEach((value) => {
      iconPromises.push(
        new Promise<string | undefined>((resolve) => {
          app
            .getFileIcon(value.executable, { size: 'large' })
            .then((icon) => {
              resolve(icon.toDataURL());
            })
            .catch(() => {
              resolve('');
            });
        })
      );
    });

    const icons = await Promise.all(iconPromises);
    console.log('Icons resolved!');
    for (let i = 0; i < finalData.length; i++) {
      finalData[i] = {
        ...finalData[i],
        icon: icons[i],
      };
    }

    const appData = finalData.filter(
      (value) => value.icon !== '' && value.name !== '' && value.version !== ''
    );

    fs.writeFileSync(app.getPath('desktop') + '\\appData.json', JSON.stringify(appData));
    console.log('Done! Found ' + appData.length + ' apps');
    console.timeEnd('Total');
  });

  globalShortcut.register('CommandOrControl+6', async () => {
    console.log('CommandOrControl+6 is pressed');
    console.log((await queryProgramFilesApps()).length);
  });

  globalShortcut.register('CommandOrControl+7', async () => {
    console.log('CommandOrControl+7 is pressed');
    console.log(await queryDesktopApps());
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
  ipcMain.handle('hexUI:runAction', runAction);
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

async function runAction(_event: Electron.IpcMainInvokeEvent, action: string, option: string) {
  if (action === 'PaperBin') {
    exec(`Clear-RecycleBin -Force`, { shell: 'powershell.exe' }, () => {
      console.log('Cleared the paper bin!' + option);
    });
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
  const collectedApps = (
    data as Array<{ DisplayName: string; DisplayIcon: string; InstallLocation: string }>
  )
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
  // Computer\HKEY_LOCAL_MACHINE\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Explorer\Shell Folders
  // Common Start Menu
  const startMenuPath = await new Promise((resolve) => {
    exec(
      `Get-ItemProperty "HKLM:\\SOFTWARE${
        os.platform() === 'win32' ? '\\WOW6432Node' : ''
      }\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Shell Folders" | Select-Object -ExpandProperty "Common Start Menu"`,
      { shell: 'powershell.exe' },
      (_err, stout) => {
        resolve(stout.trim());
      }
    );
  });
  const { stdout } = await execProm(`where /r "${startMenuPath}" *.lnk`);
  stdout.split(/(\r\n|\n|\r)/gm).forEach((x) => {
    try {
      collectedApps.push(shell.readShortcutLink(x).target);
    } catch (error) {
      return;
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
  //TODO check if this path is always the same, regardless of language or install location
  //Computer\HKEY_LOCAL_MACHINE\SOFTWARE\WOW6432Node\Valve\Steam
  const steamPath = await new Promise((resolve) => {
    exec(
      `Get-ItemProperty HKLM:\\SOFTWARE${
        os.platform() === 'win32' ? '\\WOW6432Node' : ''
      }\\Valve\\Steam | Select-Object -ExpandProperty InstallPath`,
      { shell: 'powershell.exe' },
      (_err, stout) => {
        resolve(stout.trim());
      }
    );
  });
  if (!steamPath) return [];
  const inBuffer = await fse.createReadStream(steamPath + '\\appcache\\appinfo.vdf');
  const appInfo = await readAppInfo(inBuffer);
  const collectedApps: Array<{ executable: string; name: string }> = await new Promise(
    (resolve) => {
      const collectedSteamGames: Array<{ executable: string; name: string }> = [];
      fs.readFile(steamPath + '\\steamapps\\libraryfolders.vdf', 'utf8', (err, data) => {
        try {
          if (err) return;
          const parsed = VDF.parse(data);
          // console.log(parsed);
          for (const key in parsed.libraryfolders) {
            for (const app in parsed.libraryfolders[key].apps) {
              const gameData = appInfo.filter((x) => x.id === Number.parseInt(app))[0];
              if (gameData.entries.common.name === 'Steamworks Common Redistributables') continue;
              // console.log(gameData);
              // console.log(gameData.entries.common.name);
              const firstLaunchEntry = Object.keys(gameData.entries.config.launch)[0];
              collectedSteamGames.push({
                executable: (
                  parsed.libraryfolders[key].path +
                  '\\steamapps\\common\\' +
                  gameData.entries.config.installdir +
                  '\\' +
                  gameData.entries.config.launch[firstLaunchEntry]?.executable
                ).replace(/(\\\/|\\\\)/g, '\\'),
                name: gameData.entries.common.name,
              });
            }
          }
          resolve(collectedSteamGames);
        } catch (error) {
          console.log(error);
        }
      });
    }
  );
  return collectedApps;
}

async function queryEpicGames() {
  //TODO check if this path is always the same, regardless of language or install location
  //Computer\HKEY_LOCAL_MACHINE\SOFTWARE\WOW6432Node\Epic Games\EpicGamesLauncher
  const epicPath = await new Promise<string>((resolve) => {
    exec(
      `Get-ItemProperty "HKLM:\\SOFTWARE${
        os.platform() === 'win32' ? '\\WOW6432Node' : ''
      }\\Epic Games\\EpicGamesLauncher" | Select-Object -ExpandProperty AppDataPath`,
      { shell: 'powershell.exe' },
      (_err, stout) => {
        resolve(stout.trim());
      }
    );
  });
  if (!epicPath) return [];
  const collectedApps: Array<{ executable: string; name: string }> = await new Promise(
    (resolve) => {
      const collectedEpicGames: Array<{ executable: string; name: string }> = [];
      fs.readdir(epicPath + '\\Manifests', async (err, data) => {
        if (err) return;
        for (const file of data) {
          await new Promise<void>((resolveInner) => {
            fs.readFile(epicPath + `\\Manifests\\${file}`, 'utf8', (err, data) => {
              if (err) {
                resolveInner();
                return;
              }
              const parsed = JSON.parse(data);
              if (fs.existsSync(parsed.InstallLocation + '\\' + parsed.LaunchExecutable)) {
                collectedEpicGames.push({
                  executable: (parsed.InstallLocation + '\\' + parsed.LaunchExecutable).replace(
                    /(\\\/|\\\\)/g,
                    '\\'
                  ),
                  name: parsed.DisplayName,
                });
              }
              resolveInner();
            });
          });
        }
        resolve(collectedEpicGames);
      });
    }
  );
  return collectedApps.filter((x) => x.executable.endsWith('.exe'));
}

async function queryProgramFilesApps() {
  // Computer\HKEY_LOCAL_MACHINE\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion
  // ProgramFilesDir
  // ProgramW6432Dir
  const programFilesPath = await new Promise<string>((resolve) => {
    exec(
      `Get-ItemProperty "HKLM:\\SOFTWARE${
        os.platform() === 'win32' ? '\\WOW6432Node' : ''
      }\\Microsoft\\Windows\\CurrentVersion" | Select-Object -ExpandProperty "ProgramFilesDir"`,
      { shell: 'powershell.exe' },
      (_err, stout) => {
        resolve(stout.trim());
      }
    );
  });
  const programFiles6432Path = await new Promise<string>((resolve) => {
    exec(
      `Get-ItemProperty "HKLM:\\SOFTWARE${
        os.platform() === 'win32' ? '\\WOW6432Node' : ''
      }\\Microsoft\\Windows\\CurrentVersion" | Select-Object -ExpandProperty "ProgramW6432Dir"`,
      { shell: 'powershell.exe' },
      (_err, stout) => {
        resolve(stout.trim());
      }
    );
  });
  const execProm = util.promisify(exec);
  let collectedApps: Array<string> = [];
  //TODO check if this path is always the same, regardless of language
  const folders = [programFilesPath, programFiles6432Path];
  for (const folder of folders) {
    const { stdout } = await execProm(`where /r "${folder}" *.exe`);
    stdout.split(/(\r\n|\n|\r)/gm).forEach((x) => {
      try {
        collectedApps.push(x);
      } catch (error) {
        return;
      }
    });
  }
  // Filter our unlikely results. (.urls, installers, uninstallers, etc.)
  collectedApps = collectedApps.filter(
    (x) =>
      x !== undefined &&
      x.endsWith('.exe') &&
      !x.includes('uninstall') &&
      !x.includes('Uninstall') &&
      !x.includes('setup') &&
      !x.includes('Setup') &&
      !x.includes('install') &&
      !x.includes('Install') &&
      !x.includes('repair') &&
      !x.includes('Repair') &&
      !x.includes('update') &&
      !x.includes('Update') &&
      !x.includes('upgrade') &&
      !x.includes('Upgrade') &&
      !x.includes('unins001') &&
      !x.includes('unins000') &&
      !x.includes('helper') &&
      !x.includes('Helper') &&
      !x.includes('crash') &&
      !x.includes('Crash')
  );
  return collectedApps;
}

async function queryDesktopApps() {
  const execProm = util.promisify(exec);
  let collectedApps: Array<string> = [];
  {
    const { stdout } = await execProm(`where /r "${app.getPath('desktop')}" *.lnk`);
    stdout.split(/(\r\n|\n|\r)/gm).forEach((x) => {
      try {
        collectedApps.push(shell.readShortcutLink(x).target);
      } catch (error) {
        return;
      }
    });
  }
  {
    //TODO check if this path is always the same, regardless of language
    // Computer\HKEY_LOCAL_MACHINE\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Explorer\Shell Folders
    // Common Desktop
    const publicDesktopPath = await new Promise<string>((resolve) => {
      exec(
        `Get-ItemProperty "HKLM:\\SOFTWARE${
          os.platform() === 'win32' ? '\\WOW6432Node' : ''
        }\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Shell Folders" | Select-Object -ExpandProperty "Common Desktop"`,
        { shell: 'powershell.exe' },
        (_err, stout) => {
          resolve(stout.trim());
        }
      );
    });
    const { stdout } = await execProm(`where /r "${publicDesktopPath}" *.lnk`);
    stdout.split(/(\r\n|\n|\r)/gm).forEach((x) => {
      try {
        collectedApps.push(shell.readShortcutLink(x).target);
      } catch (error) {
        return;
      }
    });
  }
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
