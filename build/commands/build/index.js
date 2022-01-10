"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.action = exports.description = exports.options = exports.name = void 0;
const path_1 = __importDefault(require("path"));
const customModules_1 = __importDefault(require("../../libs/customModules"));
exports.name = 'build';
exports.options = [
    {
        flags: '-p, --profile <test profile>',
        description: 'define test profile',
        defaultValue: 'dev'
    },
    {
        flags: '-t, --target <project directory>',
        description: 'define project directory',
        required: true
    },
    {
        flags: '-c, --compile <compiled destination>',
        description: 'define compilation output file'
    },
    {
        flags: '-c, --config <path to file>',
        description: 'define configurations for a test profile'
    }
];
exports.description = 'Run project for testing purpose.';
const action = async (params) => {
    const currentOptions = params.opts();
    const target = path_1.default.join(process.cwd(), currentOptions.target);
    (() => {
        var Module = require('module');
        var originalRequire = Module.prototype.require;
        Module.prototype.require = function () {
            const requireModule = () => {
                let imported = null;
                try {
                    imported = originalRequire.apply(this, arguments);
                }
                catch (e) {
                    imported = (0, customModules_1.default)(arguments['0']);
                }
                return imported;
            };
            const importedModule = requireModule();
            if (!importedModule)
                return;
            return importedModule;
        };
        try {
            require(path_1.default.join(target, '.flv', 'index.js'));
        }
        catch (e) {
            throw new Error(`configuration file can't be found.`);
        }
    })();
    // const configuration = project.load(currentOptions.target, currentOptions.compile);
    // configuration.profile.apply(currentOptions.profile);
};
exports.action = action;
//# sourceMappingURL=index.js.map