import fs from 'fs/promises';
import path from 'path';
import AWS from 'aws-sdk';
import S3 from 'aws-sdk/clients/s3';


async function iterateFiles(directory: string) {
	let files_output: string[] = [];

	const manage = async (baseDir: string) => {
		const files = await fs.readdir(baseDir, {withFileTypes: true});

		for (const file of files) {
			let fullPath = path.join(baseDir, file.name);
			let fullPathType = fs.lstat(fullPath);

			if ((await fullPathType).isDirectory()) await manage(fullPath);
			if ((await fullPathType).isFile()) files_output.push(fullPath);
		}

		return files_output;
	};

	return await manage(directory);
}


class s3 {
	constructor() {
		this.getS3 = this.getS3.bind(this);
		this.putObject = this.putObject.bind(this);
	}

	getS3(region: string) {
		return new S3({ region })
	}

	async putObject(region: string, params: { Bucket: string, Key: string, Body: S3.Body }) {
		return new Promise((resolve, reject) => {
			this.getS3(region).putObject(params, function(err, data) {
				if (err) return reject(err)

				return resolve(data);
			});
		})
	}

	async upload(region: string, Bucket: string, source: string, destination: string = '') {
		const source_files = (await iterateFiles(source)).map(files_iterator => files_iterator.slice(source.length));

		for (const source_file of source_files) {
			const source_file_absolute = path.join(source, source_file);
			const source_file_destination = path.join(destination, source_file);

			await this.putObject(region, {
				Bucket,
				Key: source_file_destination.startsWith('/') ? source_file_destination.substring(1) : source_file_destination,
				Body: await fs.readFile(source_file_absolute)
			});
		}

		return source_files;
	}
}

export default new s3();