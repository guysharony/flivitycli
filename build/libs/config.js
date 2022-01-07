"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = exports.readJson = exports.readFile = void 0;
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
const parse = (src) => {
    const __base = (baseDir) => {
        const content = (0, exports.readFile)(baseDir);
        if (!content)
            return {};
        const dirname = path_1.default.dirname(baseDir);
        return (0, exports.readJson)(content, function (key, value) {
            if (typeof value == "object" && ('#__import' in value)) {
                if (typeof value['#__import'] == "string") {
                    console.log(key);
                    return (__base(path_1.default.join(dirname, value['#__import'])));
                }
            }
            return value;
        });
    };
    return Object.assign({ inputDir: "./src", outputDir: "./build", profiles: [] }, __base(src));
};
exports.parse = parse;
//# sourceMappingURL=config.js.map