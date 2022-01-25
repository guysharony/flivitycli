"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.action = exports.description = exports.options = exports.name = void 0;
const path_1 = __importDefault(require("path"));
const builder_1 = __importDefault(require("../../libs/builder"));
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
    const currentOptions = params.opts();
    await (0, builder_1.default)(path_1.default.join(process.cwd(), currentOptions.target), currentOptions.profile);
};
exports.action = action;
//# sourceMappingURL=index.js.map