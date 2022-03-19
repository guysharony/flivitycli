import path from 'path';
import { Command } from 'commander';

import builder from '../../libs/builder';
import * as execs from '../../libs/execs';
import * as flivity from '../../libs/customModules/flivity';
import { CommandOptions } from '../../libs/commands';


export const name = 'basefiles';

export const options: CommandOptions = [
	{
		flags: '-t, --target <project directory>',
		description: 'define project directory',
		defaultValue: '.'
	},
	{
		flags: '-p, --push',
		description: 'Push files to Amazon'
	}
];

export const description = 'Base files to Amazon S3.';

export const action = async (params: Command) => {
	const currentOptions = params.opts();

	const zones = flivity.amazon.zones;

	const server_configuration: { [x: string]: any } = {};

	execs.display('Creating build.');
	const sw_version = Date.now().toString(16);
	for (const zone in zones) {
		flivity.amazon.region = zone;

		const server_target = path.join(process.cwd(), currentOptions.target);

		execs.display('=> Creating configurations.', true);
		server_configuration[zone] = await builder(server_target, 'deploy', {
			outputSubdir: path.join('deploy', zone),
			service_worker: {
				version: sw_version
			}
		});

		execs.display('=> Authenticating to Elastic Container Registry.', true);
		execs.execute(`aws ecr get-login-password --region ${zone} | docker login --username AWS --password-stdin 765769819972.dkr.ecr.${zone}.amazonaws.com`);
	}

	if (currentOptions.push) {
		execs.display('\nUploading base files.');
		for (const region_name in zones) {
			flivity.amazon.region = region_name;

			const region_bucket = `flivity-ec2-${flivity.amazon.zone.city}`;
			const region_files = server_configuration[region_name].output.absolute;

			execs.display(`[${region_bucket}] => Uploading '${region_files}'.`, true);
			await flivity.amazon.s3.upload(region_name, region_bucket, region_files);
		}
	}
};