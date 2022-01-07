import fs from 'fs';
import path from 'path';

interface Config {
	inputDir: string;
	outputDir: string;
	profiles: Array<{ [x: string]: any }>;
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

export const parse = (src: string): Config => {
	const __base = (baseDir: string): { [x: string]: any } => {
		const content = readFile(baseDir);
		if (!content) return {};
	
		const dirname = path.dirname(baseDir);
	
		return readJson(content, function(key: string, value: any) {
			if (typeof value == "object" && ('#__import' in value)) {
				if (typeof value['#__import'] == "string") {
					console.log(key);

					return (__base(path.join(dirname, value['#__import'])));
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