import path from 'path';
import { Command } from 'commander';

import { CommandOptions } from '../../libs/commands';
import customModules from '../../libs/customModules';
import builder from '../../libs/builder';
import * as flivity from '../../libs/customModules/flivity';
import * as project from '../../libs/project';


export const name = 'build';

export const options: CommandOptions = [
	{
		flags: '-p, --profile <test profile>',
		description: 'define test profile',
		defaultValue: 'development'
	},
	{
		flags: '-t, --target <project directory>',
		description: 'define project directory',
		required: true
	},
	{
		flags: '-c, --compile <compiled destination>',
		description: 'define compilation output file'
	},
	{
		flags: '-c, --config <path to file>',
		description: 'define configurations for a test profile'
	}
];

export const description = 'Run project for testing purpose.';

export const action = async (params: Command) => {
	const currentOptions = params.opts();

	await builder(path.join(process.cwd(), currentOptions.target), currentOptions.profile);
};