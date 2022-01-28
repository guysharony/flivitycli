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
exports.execute = exports.display = exports.timer = exports.sleep = void 0;
const colors_1 = __importDefault(require("colors"));
const child_process_1 = __importDefault(require("child_process"));
const flivity = __importStar(require("./customModules/flivity"));
colors_1.default.enable();
;
const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};
exports.sleep = sleep;
const timer = async (params = {}) => {
    let retries = 0;
    const timerBase = async (callback) => {
        var _a, _b, _c;
        if ((_a = params.retry) === null || _a === void 0 ? void 0 : _a.interval)
            (0, exports.sleep)(params.retry.interval);
        const result = await callback();
        if (result)
            return result;
        if (((_b = params.retry) === null || _b === void 0 ? void 0 : _b.max) && retries + 1 >= ((_c = params.retry) === null || _c === void 0 ? void 0 : _c.max))
            throw new Error(`Failed to execute function.`);
        retries++;
        return await timerBase(callback);
    };
    return {
        async call(callback) {
            if (params.delay)
                await (0, exports.sleep)(params.delay);
            return await timerBase(callback);
        }
    };
};
exports.timer = timer;
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