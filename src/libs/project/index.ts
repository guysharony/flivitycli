import path from 'path';
import * as compiler from './compiler';
import * as files from '../files';


export type ProjectConfig = compiler.ProjectConfig;

export const load = (dir: string) => {
	const compiled = compiler.load(path.join(dir, '.flv', 'config.json'));

	const properties = {
		profile: {
			find: (key: string) => {
				const profile = compiled.profiles.filter(profiles_iterator => profiles_iterator.name == key);

				return profile.length ? profile[0] : null;
			},
			apply: (key: string) => {
				const profile = properties.profile.find(key);

				if (!profile) {
					console.log(`flivitycli: unknown profile '${key}'\n\nSee 'flivitycli --help'`);
					return;
				}

				files.replaceVars(compiled.inputDir, compiled.outputDir, compiled.profile[0].properties)
			}
		}
	};

	return properties;
}