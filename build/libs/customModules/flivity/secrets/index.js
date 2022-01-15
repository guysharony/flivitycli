"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = __importDefault(require("aws-sdk"));
class Secrets {
    constructor() {
        this.secrets = [];
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
    async database() {
        const data = await this.getSecrets('database/credentials');
        return (data);
    }
}
exports.default = new Secrets();
//# sourceMappingURL=index.js.map