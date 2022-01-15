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
const path_1 = __importDefault(require("path"));
const customModules_1 = __importDefault(require("../../libs/customModules"));
const flivity = __importStar(require("../../libs/customModules/flivity"));
const project = __importStar(require("../../libs/project"));
exports.name = 'build';
exports.options = [
    {
        flags: '-p, --profile <test profile>',
        description: 'define test profile',
        defaultValue: 'development'
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
    console.log('test: ', await flivity.secrets.database());
    const currentOptions = params.opts();
    const target = path_1.default.join(process.cwd(), currentOptions.target);
    (async () => {
        flivity.server.mode = currentOptions.profile;
        const Module = require('module');
        const originalRequire = Module.prototype.require;
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
            const configuration = project.load(target);
            await configuration.apply({
                flivity: {
                    server: {
                        domain: flivity.server.domain,
                        mode: flivity.server.mode,
                        localIP: flivity.server.localIP
                    },
                    amazon: {
                        zone: flivity.amazon.zone
                    }
                }
            });
        }
        catch (e) {
            console.log(e);
            throw new Error(`configuration file can't be found.`);
        }
    })();
};
exports.action = action;
//# sourceMappingURL=index.js.map