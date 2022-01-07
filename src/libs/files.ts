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

			if (fullPathType.isFile()) {
				let data = fse.readFileSync(fullPath, 'utf-8');

				await Promise.all(Object.entries(vars).map(async ([key, value]) => {
					value = (!['string', 'number'].includes(typeof value)) ? serialize(value) : value;

					data = data.replace(new RegExp(`%_${key.toUpperCase()}_%`, 'g'), value);
				}));

				const destDir = fullPath.replace(new RegExp(`^(${src})`, 'g'), dest);

				fs.mkdir(path.dirname(destDir), { recursive: true }, function (err) {
					if (err) return null;

					fs.writeFileSync(destDir, data);
				});
			}
		}
	};

	await manage(src);
}