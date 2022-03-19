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
const flivity = __importStar(require("../../libs/customModules/flivity"));
exports.name = 'basefiles';
exports.options = [
    {
        flags: '-t, --target <project directory>',
        description: 'define project directory',
        defaultValue: '.'
    },
    {
        flags: '-p, --push',
        description: 'Push files to Amazon'
    }
];
exports.description = 'Base files to Amazon S3.';
const action = async (params) => {
    const currentOptions = params.opts();
    const zones = flivity.amazon.zones;
    const server_configuration = {};
    execs.display('Creating build.');
    const sw_version = Date.now().toString(16);
    for (const zone in zones) {
        flivity.amazon.region = zone;
        const server_target = path_1.default.join(process.cwd(), currentOptions.target);
        execs.display('=> Creating configurations.', true);
        server_configuration[zone] = await (0, builder_1.default)(server_target, 'deploy', {
            outputSubdir: path_1.default.join('deploy', zone),
            service_worker: {
                version: sw_version
            }
        });
        execs.display('=> Authenticating to Elastic Container Registry.', true);
        execs.execute(`aws ecr get-login-password --region ${zone} | docker login --username AWS --password-stdin 765769819972.dkr.ecr.${zone}.amazonaws.com`);
    }
    if (currentOptions.push) {
        execs.display('\nUploading base files.');
        for (const region_name in zones) {
            flivity.amazon.region = region_name;
            const region_bucket = `flivity-ec2-${flivity.amazon.zone.city}`;
            const region_files = server_configuration[region_name].output.absolute;
            execs.display(`[${region_bucket}] => Uploading '${region_files}'.`, true);
            await flivity.amazon.s3.upload(region_name, region_bucket, region_files);
        }
    }
};
exports.action = action;
//# sourceMappingURL=index.js.map