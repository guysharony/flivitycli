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
const execs = __importStar(require("../../libs/execs"));
const flivity = __importStar(require("../../libs/customModules/flivity"));
exports.name = 'deploy';
exports.options = [
    {
        flags: '-t, --target <project directory>',
        description: 'define project directory',
        defaultValue: '.'
    }
];
exports.description = 'Deploy project to AWS.';
const action = async (params) => {
    const zones = flivity.amazon.zones;
    const server_builder_launch_templates = {};
    const server_production_launch_templates = {};
    execs.display('Creating build.');
    for (const zone in zones) {
        flivity.amazon.region = zone;
        execs.display('=> Authenticating to Elastic Container Registry.', true);
        execs.execute(`aws ecr get-login-password --region ${zone} | docker login --username AWS --password-stdin 765769819972.dkr.ecr.${zone}.amazonaws.com`);
        execs.display('=> Verifying launch template.', true);
        server_builder_launch_templates[zone] = await flivity.amazon.ec2.getLaunchTemplateID(zone, 'Flivity-Website-Builder');
        server_production_launch_templates[zone] = await flivity.amazon.ec2.getLaunchTemplateID(zone, 'Flivity-Website');
    }
    execs.display('\nBuilding instance image.');
    const launchTemplateVersion = server_production_launch_templates['us-west-2'].version + 1;
    const ImageID = await flivity.amazon.ec2.createInstanceImage(server_builder_launch_templates, `flivity-website-image-v${launchTemplateVersion.toString()}`);
    execs.display('\nDeploying new image.');
    await flivity.amazon.ec2.updateInstanceImage(server_production_launch_templates, ImageID);
    execs.display('\nCode deployed successfully.');
};
exports.action = action;
//# sourceMappingURL=index.js.map