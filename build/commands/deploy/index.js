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
const child_process_1 = __importDefault(require("child_process"));
const builder_1 = __importDefault(require("../../libs/builder"));
const flivity = __importStar(require("../../libs/customModules/flivity"));
exports.name = 'deploy';
exports.options = [
    {
        flags: '-s, --servers <servers name to deploy>',
        description: 'define servers for being deployed',
        defaultValue: '*'
    },
    {
        flags: '-t, --target <project directory>',
        description: 'define project directory',
        required: true
    }
];
exports.description = 'Deploy project to AWS.';
const action = async (params) => {
    const currentOptions = params.opts();
    const requiredServers = currentOptions.servers !== '*' ? currentOptions.servers.split(',') : null;
    const zones = ['us-west-2']; //flivity.amazon.zones;
    let built = 0;
    for (const zone of zones) {
        flivity.amazon.region = zone;
        if (built)
            console.log('\n\n');
        console.log('\x1b[34m[\x1b[0m', zone, '\x1b[34m]\x1b[0m');
        console.log('\x1b[34m%s\x1b[0m', '=> Building files.');
        const configuration = await (0, builder_1.default)(path_1.default.join(process.cwd(), currentOptions.target), 'production', requiredServers);
        console.log('\x1b[34m%s\x1b[0m', '=> authenticating to AWS ECR.');
        child_process_1.default.execSync(`aws ecr get-login-password --region ${zone} | docker login --username AWS --password-stdin 765769819972.dkr.ecr.${zone}.amazonaws.com`);
        for (const server_name in configuration.servers) {
            const services = configuration.servers[server_name].compose.services;
            for (const service_name in services) {
                console.log('\x1b[34m%s\x1b[0m', `=> Building '${server_name}.${service_name}'`);
                const service = services[service_name];
                if (!('build' in service && service.build))
                    throw new Error(`build for '${service_name}' not found.`);
                const service_build = service.build;
                const service_context = 'context' in service_build && service_build.context.length ? path_1.default.join(configuration.output.absolute, server_name, service_build.context) : null;
                const service_target = 'target' in service_build && service_build.target.length ? service_build.target : null;
                child_process_1.default.execSync(`docker build -t ${service_name} ${service_target ? `--target ${service_target}` : ''} ${service_context}`);
                console.log('\x1b[34m%s\x1b[0m', `=> Deploying '${server_name}.${service_name}'`);
                child_process_1.default.execSync(`docker tag ${service_name}:latest 765769819972.dkr.ecr.${zone}.amazonaws.com/${service_name}:latest`);
                // child_process.execSync(`docker push 765769819972.dkr.ecr.${zone}.amazonaws.com/${service_name}:latest`);
            }
        }
        built++;
    }
};
exports.action = action;
//# sourceMappingURL=index.js.map