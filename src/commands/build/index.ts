import { Command } from 'commander';

import { CommandOptions } from '../../libs/commands';
import * as project from '../../libs/project';


export const name = 'build';

export const options: CommandOptions = [
	{
		flags: '-p, --profile <test profile>',
		description: 'define test profile',
		defaultValue: 'dev'
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

export const action = (params: Command) => {
	const currentOptions = params.opts();

	const configuration = project.load(currentOptions.target, currentOptions.compile);

	configuration.profile.apply(currentOptions.profile);
};