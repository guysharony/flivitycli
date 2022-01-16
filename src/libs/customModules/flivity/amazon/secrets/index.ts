import AWS from "aws-sdk";


interface Secret {
	[x: string]: any
}

class Secrets {
	private _secrets: Secret | null;

	constructor() {
		this._secrets = null;

		this.init = this.init.bind(this);
		this.getSecrets = this.getSecrets.bind(this);
		this.database = this.database.bind(this);
	}

	async init() {
		try {
			this._secrets = {
				database: await this.getSecrets('database/credentials')
			};
		} catch (e) {
			console.log(e);
			return;
		}
	}

	getSecrets(SecretId: string): Promise<JSON> {
		return new Promise((resolve, reject) => {
			try {
				const client = new AWS.SecretsManager({
					region: 'us-west-2'
				});
		
				client.getSecretValue({ SecretId }, function(err, data) {
					if (err) {
						try {
							if (err.code === 'DecryptionFailureException')
								throw err;
							else if (err.code === 'InternalServiceErrorException')
								throw err;
							else if (err.code === 'InvalidParameterException')
								throw new Error(`Parameters not valid.`);
							else if (err.code === 'InvalidRequestException')
								throw new Error(`Request to aws secrets not found.`);
							else if (err.code === 'ResourceNotFoundException')
								throw new Error(`Unknown secret '${SecretId}'.`);
							else if (err.code === 'UnrecognizedClientException')
								throw new Error("Failed to authenticate to AWS.");
						} catch (e) {
							return reject(e);
						}
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

	database(key: string) {
		if (!this._secrets) throw new Error("Amazon Web Service authentication is required for secrets.");

		return this._secrets.database[key];
	}
}

export default new Secrets();