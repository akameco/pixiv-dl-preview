'use strict';
const electron = require('electron'); // eslint-disable-line import/no-extraneous-dependencies
const chokidar = require('chokidar');
const windowState = require('electron-window-state');
const Config = require('electron-config');

const config = new Config();

const app = electron.app;

let mainWindow;

function onClosed() {
	mainWindow = null;
}

function createMainWindow() {
	const state = windowState({
		defaultWidth: 600,
		defaultHeight: 400
	});

	const {x, y, width, height} = state;

	const win = new electron.BrowserWindow({
		x,
		y,
		width,
		height,
		titleBarStyle: 'hidden',
		alwaysOnTop: config.get('alwaysOnTop') || false
	});

	state.manage(win);

	win.loadURL(`file://${__dirname}/index.html`);
	win.on('closed', onClosed);

	return win;
}

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if (!mainWindow) {
		mainWindow = createMainWindow();
	}
});

app.on('ready', () => {
	mainWindow = createMainWindow();
	const args = process.argv.slice(2);
	const watch = chokidar.watch(`${args[0]}/*.{png|jpg|jpeg|gif}`, {
		ignored: /[\/\\]\./,
		awaitWriteFinish: {
			stabilityThreshold: 2000,
			pollInterval: 100
		}
	});

	watch.on('add', path => {
		mainWindow.webContents.send('image', path);
	});

	watch.on('change', path => {
		mainWindow.webContents.send('image', path);
	});
});
