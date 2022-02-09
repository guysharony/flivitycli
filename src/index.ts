#!/usr/bin/env node

import * as commands from './commands/index';


async function app(): Promise<void> {
	commands.name("flivitycli");

	try {
		await commands.create('run');
		await commands.create('push-images');
		await commands.create('push-basefiles');
		await commands.create('deploy');

		commands.execute();
	} catch(e) {
		console.log('ERROR: ', e);
	}
}

app();