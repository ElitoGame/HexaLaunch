import { app, BrowserWindow, ipcMain, globalShortcut, screen, Tray, Menu } from 'electron';
import * as path from 'path';
import { is, electronApp } from '@electron-toolkit/utils';
import { UserSettings } from './datastore';
import * as child from 'child_process';

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
  });

  ipcMain.on('set-ignore-mouse-events', (_event, yes: boolean, forward: { forward: boolean }) => {
    mainWindow?.setIgnoreMouseEvents(yes, forward);
  });

  mainWindow.on('close', () => {
    mainWindow = null;
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
    // If called and appVisible is currently false, then the window will be shown.
    // Set it to fullscreen so that the window is maximized and the menu can be moved via CSS later.
    if (!appVisible) {
      mainWindow?.setPosition(screen.getCursorScreenPoint().x, screen.getCursorScreenPoint().y);
      mainWindow?.setFullScreen(true);
    } else {
      mainWindow?.setFullScreen(false); // Set the window to it's default size of 0,0 so it won't interfere with any user interaction.
    }
    mainWindow?.webContents.send('toggle-window', appVisible);
    const pos = {
      x: screen.getCursorScreenPoint().x - (mainWindow?.getPosition()[0] ?? 0),
      y: screen.getCursorScreenPoint().y - (mainWindow?.getPosition()[1] ?? 0),
    };
    mainWindow?.webContents.send('set-mouse-position', pos);
    console.log('CommandOrControl+Shift+Space is pressed, now: ' + appVisible);
    appVisible = !appVisible;
    // mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });

  /*
    ___ ____ ____ _   _ ____ 
     |  |__/ |__|  \_/  [__  
     |  |  \ |  |   |   ___] 
  */
  const settings: UserSettings = UserSettings.load();
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

function openApp(_event: Electron.IpcMainInvokeEvent, url: string) {
  let success = false;
  child.execFile(
    url,
    ['--version'],
    (error: child.ExecFileException | null, stdout: string, _stderr: string) => {
      if (!error) {
        success = true;
      } else {
        console.log(stdout);
      }
    }
  );
  return success;
}
