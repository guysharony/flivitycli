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
exports.execute = exports.display = void 0;
const colors_1 = __importDefault(require("colors"));
const child_process_1 = __importDefault(require("child_process"));
const flivity = __importStar(require("./customModules/flivity"));
colors_1.default.enable();
const display = (value, region = true) => {
    const zone = flivity.amazon.zone;
    const output = `${region ? `[${zone.region}] ` : ''}${value}`;
    return console.log(output[zone.color && region ? zone.color : 'white']);
};
exports.display = display;
const execute = (command) => {
    return child_process_1.default.execSync(command, { encoding: 'utf8', stdio: 'pipe' });
};
exports.execute = execute;
//# sourceMappingURL=execs.js.map