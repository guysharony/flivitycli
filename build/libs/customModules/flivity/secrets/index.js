"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = __importDefault(require("aws-sdk"));
class Secrets {
    constructor() {
        this.secrets = {};
        this.database = this.database.bind(this);
    }
    getSecrets(SecretId) {
        return new Promise((resolve, reject) => {
            try {
                const client = new aws_sdk_1.default.SecretsManager({
                    region: 'us-west-2'
                });
                client.getSecretValue({ SecretId }, function (err, data) {
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
                        }
                        catch (e) {
                            return reject(e);
                        }
                    }
                    else {
                        const secretString = data.SecretString;
                        if (!secretString)
                            throw 'SecretString error';
                        return resolve(JSON.parse(secretString));
                    }
                });
            }
            catch (e) {
                return reject(e);
            }
        });
    }
    async database(key) {
        try {
            if (!('database' in this.secrets)) {
                const data = await this.getSecrets('database/credentials');
                this.secrets['database'] = data;
            }
            return this.secrets.database[key];
        }
        catch (e) {
            console.log(e);
        }
    }
}
exports.default = new Secrets();
//# sourceMappingURL=index.js.map