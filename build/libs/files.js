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
const replaceVars = async (src, dest, options) => {
    const manage = async (baseDir) => {
        const files = fs_1.default.readdirSync(baseDir);
        for (const file of files) {
            let fullPath = path_1.default.join(baseDir, file);
            let fullPathType = fs_1.default.lstatSync(fullPath);
            if (fullPathType.isDirectory()) {
                manage(fullPath);
            }
            if (fullPathType.isFile()) {
                const secureCopy = async () => {
                    const destDir = fullPath.replace(new RegExp(`^(${src})`, 'g'), dest);
                    fs_extra_1.default.copySync(fullPath, destDir);
                    if ((options === null || options === void 0 ? void 0 : options.vars) && ['.ts', '.jsx', '.js', '.css', '.html'].includes(path_1.default.extname(file))) {
                        let data = fs_extra_1.default.readFileSync(destDir, 'utf-8');
                        await Promise.all(Object.entries(options.vars).map(async ([key, value]) => {
                            value = (!['string', 'number'].includes(typeof value)) ? (0, serialize_javascript_1.default)(value) : value;
                            data = data.replace(new RegExp(`%__${key.toLowerCase()}__%`, 'g'), value);
                        }));
                        fs_1.default.writeFileSync(destDir, data);
                    }
                };
                await secureCopy();
                fs_1.default.watchFile(fullPath, {
                    bigint: false,
                    persistent: true,
                    interval: 1000,
                }, async function (curr, prev) {
                    await secureCopy();
                    if (typeof (options === null || options === void 0 ? void 0 : options.watch) == 'function')
                        options === null || options === void 0 ? void 0 : options.watch(fullPath);
                    else {
                        console.log(`File '${fullPath}' has changed.`);
                    }
                });
            }
        }
    };
    await manage(src);
};
exports.replaceVars = replaceVars;
//# sourceMappingURL=files.js.map