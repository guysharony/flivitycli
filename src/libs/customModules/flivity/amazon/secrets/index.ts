import AWS from "aws-sdk";


interface Secret {
	[x: string]: any
}

class Secrets {
	private _secrets: Secret | null;

	constructor() {
		this._secrets = null;

		this.getSecrets = this.getSecrets.bind(this);
		this.find = this.find.bind(this);
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

	async find(key: string, name: string) {
		if (!this._secrets) this._secrets = {};

		if (!(key in this._secrets)) this._secrets[key] = await this.getSecrets(key);

		return this._secrets[key][name];
	}
}

export default new Secrets();