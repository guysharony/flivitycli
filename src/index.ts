#!/usr/bin/env node

import * as commands from './commands/index';


async function app(): Promise<void> {
	commands.name("flivitycli");

	await commands.create('auth');
	await commands.create('build');
	await commands.create('convert-compose');

	commands.execute();
}

app();