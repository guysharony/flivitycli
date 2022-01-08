"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.load = exports.readJson = exports.readFile = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const readFile = (dir) => {
    let data = null;
    try {
        data = fs_1.default.readFileSync(dir, 'utf-8');
    }
    catch (e) {
        return (null);
    }
    return (data);
};
exports.readFile = readFile;
const readJson = (content, reviver) => {
    let data = {};
    try {
        data = JSON.parse(content, reviver);
    }
    catch (e) {
        return ({});
    }
    return (data);
};
exports.readJson = readJson;
const load = (src) => {
    const __filterCommands = function (key, value) {
        let results = [];
        const commands = Object.keys(value).filter((k) => !k.indexOf(`#__${key}`) || (!k.indexOf(`#__${key}(`) && k.indexOf(')') == k.length - 1));
        for (const command of commands) {
            if (!command.indexOf(`#__${key}(`) && command.indexOf(')') == command.length - 1) {
                const name = command.substring(`#__${key}(`.length, command.length - 1);
                const imported = __base(path_1.default.join(this.dirname, value[command].replace(new RegExp('%', 'g'), name)));
                const exported = {};
                for (const imported_iterator in imported) {
                    if (imported.hasOwnProperty(imported_iterator)) {
                        exported[`${name}.${imported_iterator}`] = imported[imported_iterator];
                    }
                }
                results.push(exported);
            }
            else if (!command.indexOf(`#__${key}`)) {
                results.push(__base(path_1.default.join(this.dirname, value[command])));
            }
        }
        return results;
    };
    const __base = (baseDir) => {
        const content = (0, exports.readFile)(baseDir);
        if (!content)
            return {};
        return (0, exports.readJson)(content, function (key, value) {
            if (value instanceof Object && !(value instanceof Array)) {
                const imports = __filterCommands.call({ dirname: path_1.default.dirname(baseDir) }, "import", value);
                for (const import_iterator of imports) {
                    value = Object.assign(Object.assign({}, value), import_iterator);
                }
                return Object.keys(value).reduce((result, key) => {
                    if (!key.startsWith('#__'))
                        result[key] = value[key];
                    return result;
                }, {});
            }
            return value;
        });
    };
    return Object.assign({ inputDir: "./src", outputDir: "./build", profiles: [] }, __base(src));
};
exports.load = load;
//# sourceMappingURL=compiler.js.map