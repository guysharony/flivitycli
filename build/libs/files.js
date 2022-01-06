"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceVars = exports.readFile = void 0;
const fs_1 = __importDefault(require("fs"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const serialize_javascript_1 = __importDefault(require("serialize-javascript"));
const util_1 = __importDefault(require("util"));
exports.readFile = util_1.default.promisify(fs_1.default.readFile);
const replaceVars = async (dir, vars) => {
    const manage = async (baseDir) => {
        const files = fs_1.default.readdirSync(baseDir);
        for (const file of files) {
            let fullPath = path_1.default.join(baseDir, file);
            let fullPathType = fs_1.default.lstatSync(fullPath);
            if (fullPathType.isDirectory()) {
                manage(fullPath);
            }
            if (fullPathType.isFile()) {
                let data = fs_extra_1.default.readFileSync(fullPath, 'utf-8');
                await Promise.all(Object.entries(vars).map(async ([key, value]) => {
                    value = (!['string', 'number'].includes(typeof value)) ? (0, serialize_javascript_1.default)(value) : value;
                    data = data.replace(new RegExp(`{{${key.toLowerCase()}}}`, 'g'), value);
                }));
                console.log(data);
            }
        }
    };
    await manage(dir);
};
exports.replaceVars = replaceVars;
//# sourceMappingURL=files.js.map