import AWS from "aws-sdk";


interface Secret {
	[x: string]: any
}

class Secrets {
	secrets: Secret;

	constructor() {
		this.secrets = {};

		this.database = this.database.bind(this);
	}

	getSecrets(SecretId: string): Promise<JSON> {
		return new Promise((resolve, reject) => {
			try {
				const client = new AWS.SecretsManager({
					region: 'us-west-2'
				});
		
				client.getSecretValue({ SecretId }, function(err, data) {
					if (err) {
						if (err.code === 'DecryptionFailureException')
							throw err;
						else if (err.code === 'InternalServiceErrorException')
							throw err;
						else if (err.code === 'InvalidParameterException')
							throw err;
						else if (err.code === 'InvalidRequestException')
							throw err;
						else if (err.code === 'ResourceNotFoundException')
							throw err;
					}
					else {
						const secretString = data.SecretString;
	
						if (!secretString) throw 'SecretString error';
	
						return resolve(JSON.parse(secretString));
					}
				});
			} catch (e) {
				return reject(e);
			}
		});
	}

	async database() {
		if (!('database' in this.secrets)) {
			const data = await this.getSecrets('database/credentials');

			this.secrets['database'] = data;
		}
		
		return this.secrets.database;
	}
}

export default new Secrets();