import path from 'path';
import { Command } from 'commander';

import builder from '../../libs/builder';
import * as execs from '../../libs/execs';
import * as flivity from '../../libs/customModules/flivity';
import { CommandOptions } from '../../libs/commands';


export const name = 'images';

export const options: CommandOptions = [
	{
		flags: '-t, --target <project directory>',
		description: 'define project directory',
		defaultValue: '.'
	},
	{
		flags: '-i, --images <images to deploy>',
		description: 'define images to deploy',
		defaultValue: '*'
	}
];

export const description = 'Push images to Amazon ECR.';

export const action = async (params: Command) => {
	const currentOptions = params.opts();

	const zones = flivity.amazon.zones;

	const server_images: { [x: string]: string[] } = {};
	const server_configuration: { [x: string]: any } = {};
	const required_images: string[] | null = currentOptions.images == '*' ? null : currentOptions.images.split(',');

	execs.display('Creating build.');
	for (const zone in zones) {
		flivity.amazon.region = zone;

		const server_target = path.join(process.cwd(), currentOptions.target);

		execs.display('=> Creating configurations.', true);
		server_configuration[zone] = await builder(server_target, 'production', {
			outputSubdir: path.join(zone)
		});

		execs.display('=> Authenticating to Elastic Container Registry.', true);
		execs.execute(`aws ecr get-login-password --region ${zone} | docker login --username AWS --password-stdin 765769819972.dkr.ecr.${zone}.amazonaws.com`);
	}

	execs.display('\nBuilding images.');
	for (const zone in zones) {
		server_images[zone] = [];

		flivity.amazon.region = zone;

		const configuration = server_configuration[zone];

		for (const server of configuration.servers) {
			const server_name = server.name;
			const services = server.compose.services;

			for (const service_name in services) {
				if (!required_images || required_images.includes(service_name)) {
					execs.display(`[${server_name}] => Building '${service_name}'.`, true);
					const service = services[service_name];

					if (!('build' in service && service.build))
						throw new Error(`build for '${service_name}' not found.`);

					const service_build = service.build;
					const service_context = 'context' in service_build && service_build.context.length ? path.join(configuration.output.absolute, server_name, service_build.context) : null;
					const service_target = 'target' in service_build && service_build.target.length ? service_build.target : null;
					const service_image = `765769819972.dkr.ecr.${zone}.amazonaws.com/${service_name}`;

					execs.execute(`docker build -t ${service_image}:latest ${service_target ? `--target ${service_target}` : ''} ${service_context}`);

					server_images[zone].push(service_image);
				}
			}
		}
	}

	execs.display('\nUploading images to Elastic Container Registry.');
	for (const region_name in server_images) {
		flivity.amazon.region = region_name;

		for (const server_image of server_images[region_name]) {
			execs.display(`=> Uploading '${server_image}'.`, true);
			execs.execute(`docker push ${server_image}:latest`);
			execs.execute(`docker image rm ${server_image}`);
		}
	}
};