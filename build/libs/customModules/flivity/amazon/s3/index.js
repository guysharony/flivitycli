"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
async function iterateFiles(directory) {
    let files_output = [];
    const manage = async (baseDir) => {
        const files = fs_1.default.readdirSync(baseDir);
        for (const file of files) {
            let fullPath = path_1.default.join(baseDir, file);
            let fullPathType = fs_1.default.lstatSync(fullPath);
            if (fullPathType.isDirectory())
                manage(fullPath);
            if (fullPathType.isFile())
                files_output.push(fullPath);
        }
        return files_output;
    };
    return await manage(directory);
}
class s3 {
    constructor() {
    }
    async upload(source) {
        return await iterateFiles(source);
    }
}
exports.default = new s3();
//# sourceMappingURL=index.js.map