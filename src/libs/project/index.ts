import fs from 'fs';
import fse from 'fs-extra';
import YAML from 'yaml';
import path from 'path';
import serialize from 'serialize-javascript';
import * as compiler from './compiler';
import * as files from '../files';


interface Vars {
	[x: string]: any;
}


const loadConfig = (dir: string) => {
	let data = null;

	try {
		data = require(path.join(dir, '.flv', 'index.js'));
		data.input = path.join(dir, data.input);
		data.output = path.join(dir, data.output);
	} catch (e) {
		return (null);
	}

	return (data);
}


export type ProjectConfig = compiler.ProjectConfig;

export const load = (dir: string) => {
	const compiled = loadConfig(dir);

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
		replaceVariables: async (source: string, destination: string, vars: Vars) => {
			let data = fse.readFileSync(source, 'utf-8');

			await Promise.all(Object.entries(vars).map(async ([key, value]) => {
				value = (!['string', 'number'].includes(typeof value)) ? serialize(value) : value;

				data = data.replace(new RegExp(`%__${key.toUpperCase()}__%`, 'g'), value);
			}));

			fs.mkdir(path.dirname(`${destination}.json`), { recursive: true }, function (err) {
				if (err) return null;

				fs.writeFileSync(`${destination}.json`, JSON.stringify(YAML.parse(data), null, '\t').replace(/: "(?:[^"]+|\\")*",?$/gm, ' $&'));
			});

			/*
			fs.mkdir(path.dirname(destination), { recursive: true }, function (err) {
				if (err) return null;

				fs.writeFileSync(destination, data);
			});
			*/
		},
		apply: async (vars: Vars = {}) => {
			const variables = parseVariables(vars);

			for (const server in compiled.servers) {
				const imported = compiled.servers[server];

				if (imported.file) imported.file = path.join(compiled.output, imported.file);
				if (imported.secrets) imported.secrets = path.join(compiled.output, imported.secrets);

				console.log(imported);
			}

			/*
			for (const compose in compiled.composes) {
				const service = compiled.composes[compose];

				await properties.replaceVariables(
					path.join(compiled.input, service.entry),
					path.join(compiled.output, service.entry),
					variables
				);
			}
			*/
		}
	};

	return properties;
}