import { app, BrowserWindow, ipcMain, globalShortcut, screen } from "electron";
import * as path from "path";

let appVisible = true;

function createWindow() {
	// Create the browser window.
	const mainWindow = new BrowserWindow({
		height: 600,
		webPreferences: {
			preload: path.join(__dirname, "preload.js"),
			nodeIntegration: true,
		},
		width: 800,
		show: false,
		frame: false,
		transparent: true,
		thickFrame: false,
		skipTaskbar: true,
		alwaysOnTop: true,
		fullscreen: true,
	});

	// and load the index.html of the app.
	mainWindow.loadFile(path.join(__dirname, "../index.html"));

	mainWindow.setAlwaysOnTop(true, "pop-up-menu");
	// Open the DevTools.
	//mainWindow.webContents.openDevTools();

	mainWindow.once("ready-to-show", () => {
		mainWindow.show();
	});

	ipcMain.on("set-ignore-mouse-events", (event, yes: boolean, forward: { forward: boolean }) => {
		mainWindow.setIgnoreMouseEvents(yes, forward);
	});
}

app.disableHardwareAcceleration();

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
	createWindow();

	app.on("activate", function () {
		// On macOS it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});

	// Register a 'CommandOrControl+Shift+Space' shortcut listener.
	const ret = globalShortcut.register("CommandOrControl+Shift+Space", () => {
		const mainWindow = BrowserWindow.getAllWindows()[0];
		// TODO test if this even works lol
		// Make sure the application is displayed on the currently active screen. Only move the window if it's being activated to avoid visual glitches.
		// Set it to fullscreen so that the window is maximized and the menu can be moved via CSS later.
		if (!appVisible) {
			mainWindow.setPosition(screen.getCursorScreenPoint().x, screen.getCursorScreenPoint().y);
			mainWindow.setFullScreen(true);
		}
		mainWindow.webContents.send("toggle-window", appVisible);
		const pos = {
			x: screen.getCursorScreenPoint().x - mainWindow.getPosition()[0],
			y: screen.getCursorScreenPoint().y - mainWindow.getPosition()[1],
		};
		mainWindow.webContents.send("set-mouse-position", pos);
		console.log("CommandOrControl+Shift+Space is pressed, now: " + appVisible);
		appVisible = !appVisible;
		// mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
	});
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("will-quit", () => {
	// Unregister a shortcut.
	globalShortcut.unregister("CommandOrControl+Shift+Space");

	// Unregister all shortcuts.
	globalShortcut.unregisterAll();
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
