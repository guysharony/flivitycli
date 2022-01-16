#!/usr/bin/env node

import * as commands from './commands/index';
import elbv2 from './libs/customModules/flivity/amazon/elbv2';
import secrets from './libs/customModules/flivity/amazon/secrets';


async function app(): Promise<void> {
	commands.name("flivitycli");

	try {
		await secrets.init();
		await elbv2.init();

		await commands.create('auth');
		await commands.create('build');
		await commands.create('convert-compose');

		commands.execute();
	} catch(e) {
		console.log('ERROR: ', e);
	}
}

app();