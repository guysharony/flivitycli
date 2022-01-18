import YAML from 'yaml';
import fs from 'fs';
import fse from 'fs-extra';
import { Command } from 'commander';

import { CommandOptions } from '../../libs/commands';
import path from 'path';


export const name = 'convert-compose';

export const options: CommandOptions = [
	{
		flags: '-s, --source <docker-compose file to convert>',
		description: 'define test profile',
		required: true
	},
	{
		flags: '-d, --destination <converted docker-copose file destination>',
		description: 'define project directory',
		required: true
	}
];

export const description = 'Run project for testing purpose.';

export const action = async (params: Command) => {
	const currentOptions = params.opts();

	const compiled = YAML.parse(fse.readFileSync(currentOptions.source, 'utf-8'));

	fs.mkdir(path.dirname(currentOptions.destination), { recursive: true }, function (err) {
		if (err) return null;

		fs.writeFileSync(currentOptions.destination, JSON.stringify(compiled, null, "\t"));
	});
};