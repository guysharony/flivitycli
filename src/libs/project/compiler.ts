import fs from 'fs';
import path from 'path';


interface PropertiesConfig {
	[x: string]: any;
}

export interface ProfileConfig {
	name: string;
	properties: PropertiesConfig
}

export interface ProjectConfig {
	inputDir: string;
	outputDir: string;
	profiles: ProfileConfig[];
	[x: string]: any;
}

export const readFile = (dir: string): string | null => {
	let data = null;

	try {
		data = fs.readFileSync(dir, 'utf-8');
	} catch (e) {
		return (null);
	}

	return (data);
}

export const readJson = (content: string, reviver?: (this: any, key: string, value: any) => any): { [x: string]: any } => {
	let data = {};

	try {
		data = JSON.parse(content, reviver);
	} catch (e) {
		return ({});
	}

	return (data);
}

export const load = (src: string): ProjectConfig => {
	const __filterCommands = function(this: any, key: string, value: { [x: string]: any }) {
		let results = [];

		const commands = Object.keys(value).filter((k) => !k.indexOf(`#__${key}`) || (!k.indexOf(`#__${key}(`) && k.indexOf(')') == k.length - 1));

		for (const command of commands) {
			if (!command.indexOf(`#__${key}(`) && command.indexOf(')') == command.length - 1) {
				const name = command.substring(`#__${key}(`.length, command.length - 1);

				const imported: { [x: string]: any } = __base(path.join(this.dirname, value[command].replace(new RegExp('%', 'g'), name)));
				const exported: { [x: string]: any } = {};

				for (const imported_iterator in imported) {
					if (imported.hasOwnProperty(imported_iterator)) {
						exported[`${name}.${imported_iterator}`] = imported[imported_iterator];
					}
				}

				results.push(exported);
			} else if (!command.indexOf(`#__${key}`)) {
				results.push(__base(path.join(this.dirname, value[command])));
			}
		}

		return results;
	}
	
	const __base = (baseDir: string): { [x: string]: any } => {
		const content = readFile(baseDir);
		if (!content) return {};
	
		return readJson(content, function(key: string, value: any) {
			if (value instanceof Object && !(value instanceof Array)) {
				const imports = __filterCommands.call({ dirname: path.dirname(baseDir) }, "import", value);

				for (const import_iterator of imports) {
					value = { ...value, ...import_iterator };
				}

				return Object.keys(value).reduce((result: { [x: string]: any }, key) => {
					if (!key.startsWith('#__'))
						result[key] = value[key];
					return result;
				}, {});
			}
	
			return value;
		});
	};

	return {
		inputDir: "./src",
		outputDir: "./build",
		profiles: [],
		...__base(src)
	};
}