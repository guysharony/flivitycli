import { Command } from 'commander';
import * as testConfig from '../../config/test';
import { CommandOptions } from '../../libs/commands';
import * as files from '../../libs/files';


export const name = 'test';

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

	const profile = testConfig.find(currentOptions.profile);

	if (!profile) {
		return (null);
	}

	console.log(profile.properties.host);

	files.replaceVars(currentOptions.target, {
		host: profile.properties.host
	})
};