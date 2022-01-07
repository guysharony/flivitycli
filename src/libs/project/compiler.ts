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
	const __base = (baseDir: string): { [x: string]: any } => {
		const content = readFile(baseDir);
		if (!content) return {};
	
		const dirname = path.dirname(baseDir);
	
		return readJson(content, function(key: string, value: any) {
			if (typeof value == "object" && ('#__import' in value)) {
				if (typeof value['#__import'] == "string") {
					const imported: { [x: string]: any } = __base(path.join(dirname, value['#__import']));

					for (const importedIterator in imported) {
						if (imported.hasOwnProperty(importedIterator)) {
							this[`${key}.${importedIterator}`] = imported[importedIterator];
						}
					}

					return;
				}
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