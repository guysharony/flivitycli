"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const s3_1 = __importDefault(require("aws-sdk/clients/s3"));
async function iterateFiles(directory) {
    let files_output = [];
    const manage = async (baseDir) => {
        const files = await promises_1.default.readdir(baseDir, { withFileTypes: true });
        for (const file of files) {
            let fullPath = path_1.default.join(baseDir, file.name);
            let fullPathType = promises_1.default.lstat(fullPath);
            if ((await fullPathType).isDirectory())
                await manage(fullPath);
            if ((await fullPathType).isFile())
                files_output.push(fullPath);
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
    getS3(region) {
        return new s3_1.default({ region });
    }
    async putObject(region, params) {
        return new Promise((resolve, reject) => {
            this.getS3(region).putObject(params, function (err, data) {
                if (err)
                    return reject(err);
                return resolve(data);
            });
        });
    }
    async upload(region, Bucket, source, destination = '') {
        const source_files = (await iterateFiles(source)).map(files_iterator => files_iterator.slice(source.length));
        for (const source_file of source_files) {
            const source_file_absolute = path_1.default.join(source, source_file);
            const source_file_destination = path_1.default.join(destination, source_file);
            await this.putObject(region, {
                Bucket,
                Key: source_file_destination.startsWith('/') ? source_file_destination.substring(1) : source_file_destination,
                Body: await promises_1.default.readFile(source_file_absolute)
            });
        }
        return source_files;
    }
}
exports.default = new s3();
//# sourceMappingURL=index.js.map