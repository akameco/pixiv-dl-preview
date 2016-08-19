'use strict';
const {shell, ipcRenderer, remote} = global.require('electron');
const Config = require('electron-config');

const {app, Menu, MenuItem} = remote;
const win = remote.getCurrentWindow();
const config = new Config();

let keepAspectRatio = config.get('keepAspectRatio') || false;
let imagePath = '';
const menu = new Menu();

menu.append(new MenuItem({
	label: 'アスペクト比を維持',
	type: 'checkbox',
	checked: keepAspectRatio,
	click: () => {
		keepAspectRatio = !keepAspectRatio;
		config.set('keepAspectRatio', keepAspectRatio);
	}
}));

menu.append(new MenuItem({type: 'separator'}));

menu.append(new MenuItem({
	label: 'デフォルトのアプリで開く',
	click: () => {
		shell.openItem(imagePath);
	}
}));

menu.append(new MenuItem({
	label: '保存先フォルダを開く',
	click: () => {
		shell.showItemInFolder(imagePath);
	}
}));

menu.append(new MenuItem({type: 'separator'}));

menu.append(new MenuItem({
	label: '最前面に固定する',
	type: 'checkbox',
	checked: win.isAlwaysOnTop(),
	click: () => {
		win.setAlwaysOnTop(!win.isAlwaysOnTop());
		config.set('alwaysOnTop', win.isAlwaysOnTop());
	}
}));

menu.append(new MenuItem({type: 'separator'}));
menu.append(new MenuItem({label: '終了', click: () => app.quit()}));

const getInlineImageStyle = () => {
	const maxOption = keepAspectRatio ? 'max-' : '';
	return `style="${maxOption}width: 100%; ${maxOption}height: 100%"`;
};

window.addEventListener('contextmenu', e => {
	e.preventDefault();
	menu.popup(remote.getCurrentWindow());
}, false);

document.addEventListener('DOMContentLoaded', () => {
	const mainEl = document.querySelector('.main');
	ipcRenderer.on('image', (ev, path) => {
		imagePath = path;
		mainEl.innerHTML = `<img src='${path}' ${getInlineImageStyle()}>`;
	});
});
