import fs from 'fs';
import path from 'path';
import AWS from 'aws-sdk';


async function iterateFiles(directory: string) {
	let files_output: string[] = [];

	const manage = async (baseDir: string) => {
		const files = fs.readdirSync(baseDir);

		for (const file of files) {
			let fullPath = path.join(baseDir, file);
			let fullPathType = fs.lstatSync(fullPath);

			if (fullPathType.isDirectory()) manage(fullPath);

			if (fullPathType.isFile()) files_output.push(fullPath);
		}

		return files_output;
	};

	return await manage(directory);
}


class s3 {
	constructor() {
	}

	async upload(source: string) {
		return await iterateFiles(source);
	}
}

export default new s3();