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
exports.action = exports.description = exports.options = exports.name = void 0;
const fs_1 = __importDefault(require("fs"));
const config = __importStar(require("../../libs/config"));
const path_1 = __importDefault(require("path"));
exports.name = 'build';
exports.options = [
    {
        flags: '-p, --profile <test profile>',
        description: 'define test profile',
        defaultValue: 'dev'
    },
    {
        flags: '-t, --target <test profile>',
        description: 'define project directory',
        required: true
    },
    {
        flags: '-c, --config <path to file>',
        description: 'define configurations for a test profile'
    }
];
exports.description = 'Run project for testing purpose.';
const action = (params) => {
    const currentOptions = params.opts();
    const configuration = config.parse(path_1.default.join(currentOptions.target, '.flv', 'config.json'));
    fs_1.default.writeFileSync(path_1.default.join(currentOptions.target, '.flv', 'compiled.json'), JSON.stringify(configuration));
    /*

    let { inputDir = './src', outputDir = './build', profiles = [] }: TestConfig = files.readJson(path.join(currentOptions.target, 'flvconfig.json'));
    inputDir = path.join(currentOptions.target, inputDir);
    outputDir = path.join(currentOptions.target, outputDir);

    const profile = profiles.filter(profiles_iterator => profiles_iterator.name == currentOptions.profile);

    if (!profile.length) {
        return (null);
    }

    files.replaceVars(inputDir, outputDir, profile[0].properties)

    */
};
exports.action = action;
//# sourceMappingURL=index.js.map