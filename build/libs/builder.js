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
const customModules_1 = __importDefault(require("./customModules"));
const project = __importStar(require("./project"));
const flivity = __importStar(require("./customModules/flivity"));
async function default_1(target, mode, servers) {
    flivity.server.mode = mode;
    const Module = require('module');
    const originalRequire = Module.prototype.require;
    Module.prototype.require = function () {
        switch (arguments['0']) {
            case 'flivity':
                return (0, customModules_1.default)(arguments['0']);
            default:
                return originalRequire.apply(this, arguments);
        }
    };
    const configuration = await project.load(target);
    if (!configuration)
        return (null);
    if (servers)
        configuration.allowedServers = servers;
    try {
        return await configuration.apply({
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
        return (null);
    }
}
exports.default = default_1;
//# sourceMappingURL=builder.js.map