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
const builder_1 = __importDefault(require("../../libs/builder"));
const execs = __importStar(require("../../libs/execs"));
exports.name = 'run';
exports.options = [
    {
        flags: '-t, --target <project directory>',
        description: 'define project directory',
        defaultValue: '.'
    },
    {
        flags: '-c, --config <path to file>',
        description: 'define configurations for a test profile'
    }
];
exports.description = 'Run project for testing purpose.';
const action = async (params) => {
    const currentOptions = params.opts();
    // Start docker
    if (parseInt(execs.execute('docker info | echo $?'))) {
        return execs.display('=> Please start docker.'.red);
    }
    // Initializing
    execs.display('Initializing project.');
    execs.display('=> Creating files.'.blue);
    const result = await (0, builder_1.default)(path_1.default.join(process.cwd(), currentOptions.target), 'development', {
        watch: (path) => {
            execs.display(`=> File '${path}' has been changed.`);
        }
    });
    await execs.sleep(1000);
    execs.display('\nStarting project.');
    for (const server of result.servers) {
        execs.display(`=> Starting '${server.name}'.`.blue);
        execs.execute(`docker-compose -f ${path_1.default.join(result.output.absolute, server.name, server.file)} up --detach`);
    }
    execs.display('\nProject started successfully.');
};
exports.action = action;
//# sourceMappingURL=index.js.map