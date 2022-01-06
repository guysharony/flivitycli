import { Command } from 'commander';
import path from 'path';
import { CommandOptions } from '../../libs/commands';
import { TestConfig } from '../../config/test';
import * as files from '../../libs/files';


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

	let { inputDir = './src', outputDir = './build', profiles = [] }: TestConfig = files.readJson(path.join(currentOptions.target, 'flvconfig.json'));
	inputDir = path.join(currentOptions.target, inputDir);
	outputDir = path.join(currentOptions.target, outputDir);

	const profile = profiles.filter(profiles_iterator => profiles_iterator.name == currentOptions.profile);

	if (!profile.length) {
		return (null);
	}

	files.replaceVars(inputDir, outputDir, profile[0].properties)
};