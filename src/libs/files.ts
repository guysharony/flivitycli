import fs from 'fs';
import fse from 'fs-extra';
import path from 'path';
import serialize from 'serialize-javascript';
import util from 'util';


interface Vars {
	[x: string]: any;
}

export const readFile = util.promisify(fs.readFile);

export const replaceVars = async (src: string, dest: string, options?: { vars: Vars, watch: boolean | ((path: string) => void) }) => {
	const manage = async (baseDir: string) => {
		const files = fs.readdirSync(baseDir);

		for (const file of files) {
			let fullPath = path.join(baseDir, file);
			let fullPathType = fs.lstatSync(fullPath);

			if (fullPathType.isDirectory()) {
				manage(fullPath);
			}

			if (fullPathType.isFile()) {
				const secureCopy = async () => {
					const destDir = fullPath.replace(new RegExp(`^(${src})`, 'g'), dest);

					fse.copySync(fullPath, destDir);

					if (options?.vars && ['.ts', '.jsx', '.js', '.css', '.html'].includes(path.extname(file))) {
						let data = fse.readFileSync(destDir, 'utf-8');
		
						await Promise.all(Object.entries(options.vars).map(async ([key, value]) => {
							value = (!['string', 'number'].includes(typeof value)) ? serialize(value) : value;
		
							data = data.replace(new RegExp(`%__${key.toLowerCase()}__%`, 'g'), value);
						}));
		
						fs.writeFileSync(destDir, data);
					}
				}

				await secureCopy();

				if (options?.watch) {
					fs.watchFile(fullPath, {
						bigint: false,
						persistent: true,
						interval: 1000,
					},
					async function (curr, prev) {
						await secureCopy();

						if (typeof options?.watch == 'function') options?.watch(fullPath);
						else {
							console.log(`File '${fullPath}' has changed.`);
						}
					});
				}
			}
		}
	};

	await manage(src);
}