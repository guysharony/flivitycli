#!/usr/bin/env node

import { CommanderError } from 'commander';
import * as commands from './commands/index';
import { program } from './libs/commands';


async function app(): Promise<void> {
	commands.name("flivitycli");

	await commands.create('auth');

	commands.execute((param: CommanderError) => {
	});
}

app();