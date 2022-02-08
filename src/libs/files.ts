import fs from 'fs';
import watch from 'watch';
import fse from 'fs-extra';
import path from 'path';
import serialize from 'serialize-javascript';
import util from 'util';


interface Vars {
	[x: string]: any;
}

export const readFile = util.promisify(fs.readFile);

export const replaceVars = async (src: string, dest: string, options?: { init: boolean, vars: Vars, watch: boolean | ((path: string) => void) }) => {
	const manage = async (baseDir: string) => {
		const baseDirStat = fs.lstatSync(baseDir);

		if (baseDirStat.isFile()) {
			const destDir = baseDir.replace(new RegExp(`^(${src})`, 'g'), dest);

			fse.copySync(baseDir, destDir);

			if (options?.vars && ['.ts', '.jsx', '.js', '.css', '.html'].includes(path.extname(baseDir))) {
				let data = fse.readFileSync(destDir, 'utf-8');

				await Promise.all(Object.entries(options.vars).map(async ([key, value]) => {
					value = (!['string', 'number'].includes(typeof value)) ? serialize(value) : value;

					data = data.replace(new RegExp(`%__${key.toLowerCase()}__%`, 'g'), value);
				}));

				fs.writeFileSync(destDir, data);
			}
		}

		if (baseDirStat.isDirectory()) {
			const files = fs.readdirSync(baseDir);

			for (const file of files) {
				await manage(path.join(baseDir, file));
			}
		}
	};

	if (!options || options.init) {
		await manage(src);
	}

	if (options?.watch) {
		const watchSource = (sourceDir: string) => {
			const displayCreatedTree = async (displayDir: string) => {
				const displayDirStat = fs.lstatSync(displayDir);

				console.log(`[${displayDir}] was created.`.green);

				if (displayDirStat.isDirectory()) {
					const files = fs.readdirSync(displayDir);
		
					for (const file of files) {
						await displayCreatedTree(path.join(displayDir, file));
					}
				}
			};

			watch.watchTree(sourceDir, async function (f, curr, prev) {
				if (typeof f == "object" && prev === null && curr === null)
					return;

				if (prev === null) {
					await displayCreatedTree(f);

					await manage(f);

					if (fs.lstatSync(f).isDirectory()) {
						watchSource(f);
					}
				} else if (curr.nlink === 0) {
					console.log(`[${f}] was removed.`.red);

					try { fs.rmSync(f.replace(new RegExp(`^(${src})`, 'g'), dest), { recursive: true }); } catch (e) { }
				} else {
					console.log(`[${f}] was changed.`.white);

					await manage(f);
				}
			});
		};

		watchSource(src);
	}
}