import fs from 'fs';
import path from 'path';
import { Command } from 'commander';

import builder from '../../libs/builder';
import * as execs from '../../libs/execs';
import * as flivity from '../../libs/customModules/flivity';
import { CommandOptions } from '../../libs/commands';


export const name = 'deploy';

export const options: CommandOptions = [
	{
		flags: '-s, --servers <servers name to deploy>',
		description: 'define servers for being deployed',
		defaultValue: '*'
	},
	{
		flags: '-t, --target <project directory>',
		description: 'define project directory',
		required: true
	}
];

export const description = 'Deploy project to AWS.';

export const action = async (params: Command) => {
	const currentOptions = params.opts();

	const requiredServers = currentOptions.servers !== '*' ? currentOptions.servers.split(',') : null;

	const zones = flivity.amazon.zones;

	const server_images: { [x: string]: string[] } = {};
	const server_configuration: { [x: string]: { production: any, deploy: any } } = {};

	execs.display('Creating build.', false);
	for (const zone in zones) {
		flivity.amazon.region = zone;

		const server_target = path.join(process.cwd(), currentOptions.target);

		execs.display('=> Creating configurations.');
		server_configuration[zone] = {
			production: await builder(server_target, 'production', {
				servers: requiredServers,
				outputSubdir: path.join('production', zone)
			}),
			deploy: await builder(server_target, 'deploy', {
				servers: requiredServers,
				outputSubdir: path.join('deploy', zone)
			})
		};

		execs.display('=> Authenticating to Elastic Container Registry.');
		execs.execute(`aws ecr get-login-password --region ${zone} | docker login --username AWS --password-stdin 765769819972.dkr.ecr.${zone}.amazonaws.com`);
	}

	execs.display('\nBuilding images.', false);
	for (const zone in zones) {
		server_images[zone] = [];

		flivity.amazon.region = zone;

		const configuration = server_configuration[zone].production;

		for (const server_name in configuration.servers) {
			const services = configuration.servers[server_name].compose.services;

			for (const service_name in services) {
				execs.display(`[${server_name}] => Building '${service_name}'.`);
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

	execs.display('\nDeploying images to Elastic Container Registry.', false);
	for (const region_name in server_images) {
		flivity.amazon.region = region_name;

		for (const server_image of server_images[region_name]) {
			execs.display(`[${region_name}] => Deploying '${server_image}'.`);
			// execs.execute(`docker push ${server_image}:latest`);
			execs.execute(`docker image rm ${server_image}`);
		}
	}

	execs.display('\nDeploying base files.', false);
	for (const region_name in server_images) {
		flivity.amazon.region = region_name;

		console.log(await flivity.amazon.s3.upload(server_configuration[region_name].deploy.output.absolute));
	}
};