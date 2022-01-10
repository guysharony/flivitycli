import { Command } from 'commander';
import path from 'path';

import { CommandOptions } from '../../libs/commands';
import customModules from '../../libs/customModules';
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

export const action = async (params: Command) => {
	const currentOptions = params.opts();

	const target = path.join(process.cwd(), currentOptions.target);

	(() => {
		var Module = require('module');
		var originalRequire = Module.prototype.require;

		Module.prototype.require = function() {
			const requireModule = () => {
				let imported = null;

				try {
					imported = originalRequire.apply(this, arguments);
				} catch (e) {
					imported = customModules(arguments['0']);
				}

				return imported;
			};

			const importedModule = requireModule();

			if (!importedModule) return;

			return importedModule;
		};

		try {
			require(path.join(target, '.flv', 'index.js'));
		} catch (e) {
			console.log(e);

			throw new Error(`configuration file can't be found.`);
		}
	})();

	// const configuration = project.load(currentOptions.target, currentOptions.compile);

	// configuration.profile.apply(currentOptions.profile);
};