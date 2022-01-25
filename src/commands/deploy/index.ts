import path from 'path';
import child_process from 'child_process';
import { Command } from 'commander';

import builder from '../../libs/builder';
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

	const zones = [ 'us-west-2' ]; //flivity.amazon.zones;

	let built = 0;

	for (const zone of zones) {
		flivity.amazon.region = zone;

		if (built) console.log('\n\n');

		console.log('\x1b[34m[\x1b[0m', zone, '\x1b[34m]\x1b[0m');

		console.log('\x1b[34m%s\x1b[0m', '=> Building files.');
		const configuration = await builder(path.join(process.cwd(), currentOptions.target), 'production', requiredServers);

		console.log('\x1b[34m%s\x1b[0m', '=> authenticating to AWS ECR.');
		child_process.execSync(`aws ecr get-login-password --region ${zone} | docker login --username AWS --password-stdin 765769819972.dkr.ecr.${zone}.amazonaws.com`);

		for (const server_name in configuration.servers) {
			const services = configuration.servers[server_name].compose.services;

			for (const service_name in services) {
				console.log('\x1b[34m%s\x1b[0m', `=> Building '${server_name}.${service_name}'`);
				const service = services[service_name];

				if (!('build' in service && service.build))
					throw new Error(`build for '${service_name}' not found.`);

				const service_build = service.build;
				const service_context = 'context' in service_build && service_build.context.length ? path.join(configuration.output.absolute, server_name, service_build.context) : null;
				const service_target = 'target' in service_build && service_build.target.length ? service_build.target : null;

				child_process.execSync(`docker build -t ${service_name} ${service_target ? `--target ${service_target}` : ''} ${service_context}`);

				console.log('\x1b[34m%s\x1b[0m', `=> Deploying '${server_name}.${service_name}'`);
				child_process.execSync(`docker tag ${service_name}:latest 765769819972.dkr.ecr.${zone}.amazonaws.com/${service_name}:latest`);
				// child_process.execSync(`docker push 765769819972.dkr.ecr.${zone}.amazonaws.com/${service_name}:latest`);
			}
		}

		built++;
	}
};