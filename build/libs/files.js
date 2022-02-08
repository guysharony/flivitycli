"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceVars = exports.readFile = void 0;
const fs_1 = __importDefault(require("fs"));
const watch_1 = __importDefault(require("watch"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const serialize_javascript_1 = __importDefault(require("serialize-javascript"));
const util_1 = __importDefault(require("util"));
exports.readFile = util_1.default.promisify(fs_1.default.readFile);
const replaceVars = async (src, dest, options) => {
    const manage = async (baseDir) => {
        const baseDirStat = fs_1.default.lstatSync(baseDir);
        if (baseDirStat.isFile()) {
            const destDir = baseDir.replace(new RegExp(`^(${src})`, 'g'), dest);
            fs_extra_1.default.copySync(baseDir, destDir);
            if ((options === null || options === void 0 ? void 0 : options.vars) && ['.ts', '.jsx', '.js', '.css', '.html'].includes(path_1.default.extname(baseDir))) {
                let data = fs_extra_1.default.readFileSync(destDir, 'utf-8');
                await Promise.all(Object.entries(options.vars).map(async ([key, value]) => {
                    value = (!['string', 'number'].includes(typeof value)) ? (0, serialize_javascript_1.default)(value) : value;
                    data = data.replace(new RegExp(`%__${key.toLowerCase()}__%`, 'g'), value);
                }));
                fs_1.default.writeFileSync(destDir, data);
            }
        }
        if (baseDirStat.isDirectory()) {
            const files = fs_1.default.readdirSync(baseDir);
            for (const file of files) {
                await manage(path_1.default.join(baseDir, file));
            }
        }
    };
    await manage(src);
    if (options === null || options === void 0 ? void 0 : options.watch) {
        const watchSource = (sourceDir) => {
            const displayCreatedTree = async (displayDir) => {
                const displayDirStat = fs_1.default.lstatSync(displayDir);
                console.log(`[${displayDir}] was created.`.green);
                if (displayDirStat.isDirectory()) {
                    const files = fs_1.default.readdirSync(displayDir);
                    for (const file of files) {
                        await displayCreatedTree(path_1.default.join(displayDir, file));
                    }
                }
            };
            watch_1.default.watchTree(sourceDir, async function (f, curr, prev) {
                if (typeof f == "object" && prev === null && curr === null)
                    return;
                if (prev === null) {
                    await displayCreatedTree(f);
                    await manage(f);
                    if (fs_1.default.lstatSync(f).isDirectory()) {
                        watchSource(f);
                    }
                }
                else if (curr.nlink === 0) {
                    console.log(`[${f}] was removed.`.red);
                    try {
                        fs_1.default.rmSync(f.replace(new RegExp(`^(${src})`, 'g'), dest), { recursive: true });
                    }
                    catch (e) { }
                }
                else {
                    console.log(`[${f}] was changed.`.white);
                    await manage(f);
                }
            });
        };
        watchSource(src);
    }
};
exports.replaceVars = replaceVars;
//# sourceMappingURL=files.js.map