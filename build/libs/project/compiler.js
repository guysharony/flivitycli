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
    const __filterCommands = (key, value) => {
        let results = [];
        const commands = Object.keys(value).filter((k) => !k.indexOf(`#__${key}`) || (!k.indexOf(`#__${key}(`) && k.indexOf(')') == k.length - 1));
        for (const command of commands) {
            if (!command.indexOf(`#__${key}(`) && command.indexOf(')') == command.length - 1) {
                results.push(value[command].replace(new RegExp('%', 'g'), command.substring(`#__${key}(`.length, command.length - 1)));
            }
            else if (!command.indexOf(`#__${key}`)) {
                results.push(value[command]);
            }
        }
        return results;
    };
    const __base = (baseDir) => {
        const content = (0, exports.readFile)(baseDir);
        if (!content)
            return {};
        const dirname = path_1.default.dirname(baseDir);
        return (0, exports.readJson)(content, function (key, value) {
            if (typeof value == "object") {
                const imports = __filterCommands("import", value);
                value = Object.assign(Object.assign({}, value), imports.map(__base));
                /*

                if ('#__import' in value && typeof value['#__import'] == "string") {
                    const imported: { [x: string]: any } = __base(path.join(dirname, value['#__import']));

                    for (const importedIterator in imported) {
                        if (imported.hasOwnProperty(importedIterator)) {
                            this[`${key}.${importedIterator}`] = imported[importedIterator];
                        }
                    }

                    return;
                }

                */
            }
            return value;
        });
    };
    return Object.assign({ inputDir: "./src", outputDir: "./build", profiles: [] }, __base(src));
};
exports.load = load;
//# sourceMappingURL=compiler.js.map