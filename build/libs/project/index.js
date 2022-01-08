"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.load = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const compiler = __importStar(require("./compiler"));
const files = __importStar(require("../files"));
const load = (dir) => {
    const compiled = compiler.load(path_1.default.join(dir, '.flv', 'index.json'));
    const properties = {
        compile: (dest = path_1.default.join(dir, '.flv', 'compiled.json')) => {
            fs_1.default.writeFileSync(dest, JSON.stringify(compiled));
        },
        profile: {
            find: (key) => {
                const profile = compiled.profiles.filter(profiles_iterator => profiles_iterator.name == key);
                return profile.length ? profile[0] : null;
            },
            apply: (key) => {
                const profile = properties.profile.find(key);
                if (!profile) {
                    console.log(`flivitycli: unknown profile '${key}'\n\nSee 'flivitycli --help'`);
                    return;
                }
                files.replaceVars(compiled.inputDir, compiled.outputDir, compiled.profile[0].properties);
            }
        }
    };
    return properties;
};
exports.load = load;
//# sourceMappingURL=index.js.map