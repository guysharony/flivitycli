import fs from 'fs';
import YAML from 'yaml';
import path from 'path';
import serialize from 'serialize-javascript';
import * as files from '../files';


interface Vars {
	[x: string]: any;
}


const loadConfig = (dir: string) => {
	try {
		return require(path.join(dir, '.flv', 'index.js'));
	} catch (e: unknown) {
		if (e instanceof Error) {
			console.log(`flivitycli: ${e.message}`);
		}
	}
}


export const load = async (dir: string) => {
	let _outputSubdir: string | null = null;
	let _watch: boolean | ((path: string) => void) = false;

	const compiled = loadConfig(dir)();

	if (!compiled) return (null);

	compiled.input = {
		absolute: path.join(dir, compiled.input),
		relative: compiled.input
	};
	compiled.output = {
		source: path.join(dir, compiled.output),
		absolute: path.join(dir, compiled.output),
		relative: compiled.output
	};

	const parseVariables = (vars: Vars = {}) => {
		const __base = (imported: Vars, prefix: string | null = null) => {
			let exported: { [x: string]: any } = {};

			for (const imported_iterator in imported) {
				const exported_key = `${prefix ? `${prefix}.` : ''}${imported_iterator}`.toUpperCase();

				if (imported[imported_iterator] instanceof Object) {
					exported = { ...exported, ...__base(imported[imported_iterator], exported_key) };
				} else {
					exported[exported_key] = imported[imported_iterator];
				}
			}

			return exported;
		}

		return __base(vars);
	};

	const properties = {
		set outputSubdir(value: string | null) {
			_outputSubdir = value;
		},
		set watch(value: boolean | ((path: string) => void)) {
			_watch = value;
		},
		apply: async (vars: Vars = {}) => {
			if (_outputSubdir) {
				compiled.output.absolute = path.join(compiled.output.absolute, _outputSubdir);
				compiled.output.relative = path.join(compiled.output.relative, _outputSubdir);
			}

			let variables = parseVariables(vars);

			fs.rmSync(compiled.output.absolute, { recursive: true, force: true });

			for (const server of compiled.servers) {
				const server_name = server.name;
				const server_source = 'source' in server ? server.source : server_name;

				const compose_file = path.join(compiled.output.absolute, server_name, server.file);
				const secrets_dir = {
					relative: path.join(server.secrets),
					absolute: path.join(compiled.output.absolute, server_name, server.secrets)
				};

				const imported_compose = server.compose;

				for (const service_name in imported_compose.services) {
					const service = imported_compose.services[service_name];
					const service_secrets = service.secrets;

					let service_environment = { ...variables };

					if (service.environment) {
						service_environment = {
							...service_environment,
							...parseVariables({
								flivity: {
									env: service.environment
								}
							})
						};
					}

					if ('build' in service) {
						const inputContext = path.join(compiled.input.absolute, server_source, service.build.context);
						const outputContext = path.join(compiled.output.absolute, server_name, service.build.context);

						await files.replaceVars(inputContext, outputContext, {
							vars: service_environment,
							watch: _watch
						});
					}

					if (service.environment) {
						const env_file_relative = path.join('build' in service ? service.build.context : `./services/${service.container_name}/`, 'env');
						const env_file_absolute = path.join(compiled.output.absolute, server_name, env_file_relative);

						const env_data = (await Promise.all(Object.entries(service.environment).map(async ([k, v]) => {
							const env_value_func = async () => { return await v; };

							return `${k}=${(await env_value_func())}`;
						}))).join('\n');

						fs.mkdirSync(path.dirname(env_file_absolute), { recursive: true });

						fs.openSync(env_file_absolute, 'w');

						fs.writeFileSync(env_file_absolute, env_data);

						delete service.environment;

						service.env_file = [ env_file_relative ];
					}

					const service_secrets_absolute = secrets_dir.absolute.replace(new RegExp('%__service__%', 'g'), service_name);
					const service_secrets_relative = secrets_dir.relative.replace(new RegExp('%__service__%', 'g'), service_name);

					let secrets: string[] = [];

					for (const secret_name in service_secrets) {
						const compose_secret_name = `${service_name}__${secret_name}`.toLowerCase();

						const secret_absolute = path.join(service_secrets_absolute, secret_name);
						const secret_relative = path.join(service_secrets_relative, secret_name);

						const createSecret = async () => new Promise((resolve, rejects) => {
							fs.mkdir(path.dirname(secret_absolute), { recursive: true }, async function (err) {
								if (err) return rejects(null);

								const secret_value_func = async () => { return await service_secrets[secret_name]; };

								const secret_value = await secret_value_func();

								fs.writeFileSync(secret_absolute, (!['string', 'number'].includes(typeof secret_value)) ? serialize(secret_value) : `${secret_value}`);

								if (!('secrets' in imported_compose)) server.compose['secrets'] = {};
								imported_compose.secrets[compose_secret_name] = { file: secret_relative };

								secrets.push(compose_secret_name);

								return resolve(compose_secret_name);
							});
						});

						await createSecret();
					}

					if (secrets.length) {
						imported_compose.services[service_name].secrets = secrets;
					}
				}

				fs.mkdir(path.dirname(compose_file), { recursive: true }, function (err) {
					if (err) return null;
	
					fs.writeFileSync(compose_file, YAML.stringify(imported_compose));
				});
			}

			return compiled;
		}
	};

	return properties;
}