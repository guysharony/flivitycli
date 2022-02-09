import path from 'path';
import { Command } from 'commander';

import builder from '../../libs/builder';
import * as execs from '../../libs/execs';
import * as flivity from '../../libs/customModules/flivity';
import { CommandOptions } from '../../libs/commands';


export const name = 'deploy';

export const options: CommandOptions = [
	{
		flags: '-t, --target <project directory>',
		description: 'define project directory',
		required: true
	}
];

export const description = 'Deploy project to AWS.';

export const action = async (params: Command) => {
	const zones = flivity.amazon.zones;

	const server_builder_launch_templates: { [x: string]: { id: string; version: number; } } = {};
	const server_production_launch_templates: { [x: string]: { id: string; version: number; } } = {};

	execs.display('Creating build.');
	for (const zone in zones) {
		flivity.amazon.region = zone;

		execs.display('=> Authenticating to Elastic Container Registry.', true);
		execs.execute(`aws ecr get-login-password --region ${zone} | docker login --username AWS --password-stdin 765769819972.dkr.ecr.${zone}.amazonaws.com`);

		execs.display('=> Verifying launch template.', true);
		server_builder_launch_templates[zone] = await flivity.amazon.ec2.getLaunchTemplateID(zone, 'Flivity-Website-Builder');
		server_production_launch_templates[zone] = await flivity.amazon.ec2.getLaunchTemplateID(zone, 'Flivity-Website');
	}

	execs.display('\nBuilding instance image.');
	const launchTemplateVersion = server_production_launch_templates['us-west-2'].version + 1;

	const ImageID = await flivity.amazon.ec2.createInstanceImage(server_builder_launch_templates, `flivity-website-image-v${launchTemplateVersion.toString()}`);

	execs.display('\nDeploying new image.');
	await flivity.amazon.ec2.updateInstanceImage(server_production_launch_templates, ImageID);

	execs.display('\nCode deployed successfully.');
};