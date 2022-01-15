"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSecrets = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const getSecrets = (SecretId) => {
    const client = new aws_sdk_1.default.SecretsManager({
        region: 'us-west-2'
    });
    client.getSecretValue({ SecretId }, function (err, data) {
        if (err) {
            if (err.code === 'DecryptionFailureException')
                // Secrets Manager can't decrypt the protected secret text using the provided KMS key.
                // Deal with the exception here, and/or rethrow at your discretion.
                throw err;
            else if (err.code === 'InternalServiceErrorException')
                // An error occurred on the server side.
                // Deal with the exception here, and/or rethrow at your discretion.
                throw err;
            else if (err.code === 'InvalidParameterException')
                // You provided an invalid value for a parameter.
                // Deal with the exception here, and/or rethrow at your discretion.
                throw err;
            else if (err.code === 'InvalidRequestException')
                // You provided a parameter value that is not valid for the current state of the resource.
                // Deal with the exception here, and/or rethrow at your discretion.
                throw err;
            else if (err.code === 'ResourceNotFoundException')
                // We can't find the resource that you asked for.
                // Deal with the exception here, and/or rethrow at your discretion.
                throw err;
        }
        else {
            const secretString = data.SecretString;
            if (secretString) {
                console.log(JSON.parse(secretString));
            }
        }
        // Your code goes here. 
    });
};
exports.getSecrets = getSecrets;
//# sourceMappingURL=aws.js.map