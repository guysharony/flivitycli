"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readJson = exports.replaceVars = exports.readFile = void 0;
const fs_1 = __importDefault(require("fs"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const serialize_javascript_1 = __importDefault(require("serialize-javascript"));
const util_1 = __importDefault(require("util"));
exports.readFile = util_1.default.promisify(fs_1.default.readFile);
const replaceVars = async (src, dest, vars) => {
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
                    data = data.replace(new RegExp(`%_${key.toUpperCase()}_%`, 'g'), value);
                }));
                const destDir = fullPath.replace(new RegExp(`^(${src})`, 'g'), dest);
                fs_1.default.mkdir(path_1.default.dirname(destDir), { recursive: true }, function (err) {
                    if (err)
                        return null;
                    fs_1.default.writeFileSync(destDir, data);
                });
            }
        }
    };
    await manage(src);
};
exports.replaceVars = replaceVars;
const readJson = (dir) => {
    const data = fs_1.default.readFileSync(dir, 'utf-8');
    return JSON.parse(data);
};
exports.readJson = readJson;
//# sourceMappingURL=files.js.map