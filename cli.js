#!/usr/bin/env node
'use strict';
const spawn = require('child_process').spawn;
const electron = require('electron');
const updateNotifier = require('update-notifier');
const Conf = require('conf');
const pixivDl = require('pixiv-dl');
const meow = require('meow');

const config = new Conf();

const cli = meow(`
	Usage
	  $ pixiv-dl-preview [input]

	Options
	  --uername, -u   pixiv username (use cache)↲
	  --password, -p  pixiv password (use cache)↲
	  --output, -o    output directory [Default: curret dir]
	  --name, -n      custom filename
	  --delay, -d     delay time (ms) [Default: 5000]
	  ranking         ranking mode
	    day | week | month | day_male | day_female | week_original | week_rookie | day_mang
	    day_r18 | day_male_r18 | day_female_r18 | week_r18 | week_r18g

	Examples
	  $ pixiv-dl-preview リゼロ10000users入り --username hoge --password fuga
	  $ pixiv-dl-preview リゼロ10000users入り --output rezero --name user.account-title
	  $ pixiv-dl-preview ranking day --output rezero --name user.account-title
`, {
	alias: {
		output: 'o',
		name: 'n',
		username: 'u',
		password: 'p',
		delay: 'd'
	},
	default: {
		output: process.cwd(),
		delay: 5000
	}
});

updateNotifier({pkg: cli.pkg}).notify();

if (!cli.input[0]) {
	console.log('required word');
	process.exit(1);
}

const opts = cli.flags;

if (cli.input[1]) {
	opts.mode = cli.input[1];
}

opts.username = opts.username || config.get('username');
opts.password = opts.password || config.get('password');

if (!(opts.username && opts.password)) {
	console.log('require username && password');
	process.exit(1);
}

const ps = spawn(electron, [__dirname, opts.output], {stdio: 'inherit'});

pixivDl(cli.input[0], opts).then(() => {
	ps.kill('SIGHUP');
	process.exit(0);
}).catch(err => {
	console.error(err);
	process.exit(1);
});

config.set('username', opts.username);
config.set('password', opts.password);
