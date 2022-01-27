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
exports.name = 'deploy';
exports.options = [
    {
        flags: '-t, --target <project directory>',
        description: 'define project directory',
        required: true
    }
];
exports.description = 'Deploy project to AWS.';
const action = async (params) => {
    const currentOptions = params.opts();
    const requiredServers = ['website'];
    const zones = flivity.amazon.zones;
    const server_images = {};
    const server_launch_templates = {};
    const server_instances = {};
    const server_configuration = {};
    flivity.amazon.region = 'us-west-2';
    const instanceData = await flivity.amazon.ec2.getInstanceDNSName('us-west-2', 'i-03d2d609a15b03813');
    console.log('Instance DNS: ', instanceData);
    execs.display('Creating build.', false);
    for (const zone in zones) {
        flivity.amazon.region = zone;
        const server_target = path_1.default.join(process.cwd(), currentOptions.target);
        execs.display('=> Creating configurations.');
        server_configuration[zone] = {
            production: await (0, builder_1.default)(server_target, 'production', {
                servers: requiredServers,
                outputSubdir: path_1.default.join('production', zone)
            }),
            deploy: await (0, builder_1.default)(server_target, 'deploy', {
                servers: requiredServers,
                outputSubdir: path_1.default.join('deploy', zone)
            })
        };
        execs.display('=> Authenticating to Elastic Container Registry.');
        execs.execute(`aws ecr get-login-password --region ${zone} | docker login --username AWS --password-stdin 765769819972.dkr.ecr.${zone}.amazonaws.com`);
        execs.display('=> Verifying launch template.');
        server_launch_templates[zone] = await flivity.amazon.ec2.getLaunchTemplateID(zone, 'Flivity-Website-Builder');
    }
    execs.display('\nBuilding images.', false);
    for (const zone in zones) {
        server_images[zone] = [];
        flivity.amazon.region = zone;
        const configuration = server_configuration[zone].production;
        for (const server_name in configuration.servers) {
            const services = configuration.servers[server_name].compose.services;
            for (const service_name in services) {
                execs.display(`[${server_name}] => Building '${service_name}'.`);
                const service = services[service_name];
                if (!('build' in service && service.build))
                    throw new Error(`build for '${service_name}' not found.`);
                const service_build = service.build;
                const service_context = 'context' in service_build && service_build.context.length ? path_1.default.join(configuration.output.absolute, server_name, service_build.context) : null;
                const service_target = 'target' in service_build && service_build.target.length ? service_build.target : null;
                const service_image = `765769819972.dkr.ecr.${zone}.amazonaws.com/${service_name}`;
                execs.execute(`docker build -t ${service_image}:latest ${service_target ? `--target ${service_target}` : ''} ${service_context}`);
                server_images[zone].push(service_image);
            }
        }
    }
    execs.display('\nUploading images to Elastic Container Registry.', false);
    for (const region_name in server_images) {
        flivity.amazon.region = region_name;
        for (const server_image of server_images[region_name]) {
            execs.display(`=> Uploading '${server_image}'.`);
            // execs.execute(`docker push ${server_image}:latest`);
            execs.execute(`docker image rm ${server_image}`);
        }
    }
    execs.display('\nUploading base files.', false);
    for (const region_name in server_images) {
        flivity.amazon.region = region_name;
        const region_bucket = `flivity-ec2-${flivity.amazon.zone.city}`;
        const region_files = server_configuration[region_name].deploy.output.absolute;
        execs.display(`[${region_bucket}] => Uploading '${region_files}'.`);
        // await flivity.amazon.s3.upload(region_name, region_bucket, region_files);
    }
    execs.display('\nBuilding instance image.', false);
    for (const zone in zones) {
        flivity.amazon.region = zone;
        execs.display('=> Preparing temporary instance.');
        server_instances[zone] = await flivity.amazon.ec2.runInstanceFromTemplate(zone, server_launch_templates[zone]);
        execs.display(`[${server_instances[zone]}] => Wating for instance to be available.`);
        let instanceData = await flivity.amazon.ec2.getInstanceInformation(zone, server_instances[zone]);
        console.log('Instance data: ', instanceData);
    }
};
exports.action = action;
//# sourceMappingURL=index.js.map