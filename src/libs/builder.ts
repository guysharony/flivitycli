import customModules from './customModules';
import * as project from './project';
import * as flivity from './customModules/flivity';
import { ServerModes } from './customModules/flivity/server';


export default async function (target: string, mode: ServerModes, servers?: string[]) {
	flivity.server.mode = mode;

	const Module = require('module');
	const originalRequire = Module.prototype.require;

	Module.prototype.require = function() {
		switch (arguments['0']) {
			case 'flivity':
				return customModules(arguments['0']);
			default:
				return originalRequire.apply(this, arguments);
		}
	};

	const configuration = await project.load(target);

	if (!configuration) return (null);

	if (servers) configuration.allowedServers = servers;

	try {
		return await configuration.apply({
			flivity: {
				server: {
					domain: flivity.server.domain,
					mode: flivity.server.mode,
					localIP: flivity.server.localIP
				},
				amazon: {
					zone: flivity.amazon.zone
				}
			}
		});
	} catch (e) {
		console.log(e);
		return (null);
	}
}