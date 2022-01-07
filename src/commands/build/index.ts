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
		flags: '-t, --target <test profile>',
		description: 'define project directory',
		required: true
	},
	{
		flags: '-c, --config <path to file>',
		description: 'define configurations for a test profile'
	}
];

export const description = 'Run project for testing purpose.';

export const action = (params: Command) => {
	const currentOptions = params.opts();

	const configuration = project.load(currentOptions.target);

	configuration.profile.apply(currentOptions.profile);
};