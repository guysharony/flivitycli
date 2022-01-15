"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.action = exports.description = exports.options = exports.name = void 0;
const yaml_1 = __importDefault(require("yaml"));
const fs_1 = __importDefault(require("fs"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
exports.name = 'convert-compose';
exports.options = [
    {
        flags: '-s, --source <docker-compose file to convert>',
        description: 'define test profile',
        required: true
    },
    {
        flags: '-d, --destination <converted docker-copose file destination>',
        description: 'define project directory',
        required: true
    }
];
exports.description = 'Run project for testing purpose.';
const action = async (params) => {
    const currentOptions = params.opts();
    const compiled = yaml_1.default.parse(fs_extra_1.default.readFileSync(currentOptions.source, 'utf-8'));
    console.log(compiled);
    fs_1.default.mkdir(path_1.default.dirname(currentOptions.destination), { recursive: true }, function (err) {
        if (err)
            return null;
        fs_1.default.writeFileSync(currentOptions.destination, JSON.stringify(compiled, null, "\t"));
    });
};
exports.action = action;
//# sourceMappingURL=index.js.map