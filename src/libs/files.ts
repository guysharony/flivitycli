import fs from 'fs';
import fse from 'fs-extra';
import path from 'path';
import serialize from 'serialize-javascript';
import util from 'util';


interface Vars {
	[x: string]: any;
}

export const readFile = util.promisify(fs.readFile);

export const replaceVars = async (src: string, dest: string, vars: Vars) => {
	const manage = async (baseDir: string) => {
		const files = fs.readdirSync(baseDir);

		for (const file of files) {
			let fullPath = path.join(baseDir, file);
			let fullPathType = fs.lstatSync(fullPath);

			if (fullPathType.isDirectory()) {
				manage(fullPath);
			}

			if (fullPathType.isFile() && ['.mjs', '.js', '.css', '.html'].includes(path.extname(file))) {
				const destDir = fullPath.replace(new RegExp(`^(${src})`, 'g'), dest);

				let data = fse.readFileSync(destDir, 'utf-8');

				await Promise.all(Object.entries(vars).map(async ([key, value]) => {
					value = (!['string', 'number'].includes(typeof value)) ? serialize(value) : value;

					data = data.replace(new RegExp(`%__${key.toLowerCase()}__%`, 'g'), value);
				}));

				fs.writeFileSync(destDir, data);
			}
		}
	};

	fse.copySync(src, dest);

	await manage(src);
}