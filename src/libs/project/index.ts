import fs from 'fs';
import path from 'path';
import * as compiler from './compiler';
import * as files from '../files';


export type ProjectConfig = compiler.ProjectConfig;

export const load = (dir: string, compile_dest?: string | boolean) => {
	const compiled = compiler.load(path.join(dir, '.flv', 'index.json'));
	compiled.inputDir = path.join(dir, compiled.inputDir);
	compiled.outputDir = path.join(dir, compiled.outputDir);

	if (compile_dest) {
		fs.writeFileSync(typeof compile_dest == "string" ? compile_dest : path.join(dir, '.flv', 'compiled.json'), JSON.stringify(compiled));
	}

	const properties = {
		profile: {
			find: (key: string) => {
				const profile = compiled.profiles.filter(profiles_iterator => profiles_iterator.name == key);

				return profile.length ? profile[0] : null;
			},
			apply: async (key: string) => {
				const profile = properties.profile.find(key);

				if (!profile) {
					console.log(`flivitycli: unknown profile '${key}'\n\nSee 'flivitycli --help'`);
					return;
				}

				await files.replaceVars(compiled.inputDir, compiled.outputDir, profile.properties);
			}
		}
	};

	return properties;
}