import path from 'path';
import { Command } from 'commander';

import builder from '../../libs/builder';
import { CommandOptions } from '../../libs/commands';
import * as execs from '../../libs/execs';


export const name = 'run';

export const options: CommandOptions = [
	{
		flags: '-t, --target <project directory>',
		description: 'define project directory',
		defaultValue: '.'
	},
	{
		flags: '-c, --config <path to file>',
		description: 'define configurations for a test profile'
	}
];

export const description = 'Run project for testing purpose.';

export const action = async (params: Command) => {
	const currentOptions = params.opts();


	// Start docker
	if (parseInt(execs.execute('docker info | echo $?'))) {
		return execs.display('=> Please start docker.'.red);
	}

	// Initializing
	execs.display('Initializing project.');

	execs.display('=> Creating files.'.blue);
	const result = await builder(path.join(process.cwd(), currentOptions.target), 'development', {
		watch: (path: string) => {
			execs.display(`=> File '${path}' has been changed.`);
		}
	});

	await execs.sleep(1000);

	execs.display('\nStarting project.');
	for (const server of result.servers) {
		execs.display(`=> Starting '${server.name}'.`.blue);
		execs.execute(`docker-compose -f ${path.join(result.output.absolute, server.name, server.file)} up --detach`);
	}

	execs.display('\nProject started successfully.');
};