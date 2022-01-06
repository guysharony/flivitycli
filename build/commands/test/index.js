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
Object.defineProperty(exports, "__esModule", { value: true });
exports.action = exports.description = exports.options = exports.name = void 0;
const testConfig = __importStar(require("../../config/test"));
const files = __importStar(require("../../libs/files"));
exports.name = 'test';
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
    const profile = testConfig.find(currentOptions.profile);
    if (!profile) {
        return (null);
    }
    console.log(profile.properties.host);
    files.replaceVars(currentOptions.target, {
        host: profile.properties.host
    });
};
exports.action = action;
//# sourceMappingURL=index.js.map