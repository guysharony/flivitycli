"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = __importDefault(require("child_process"));
function default_1(command) {
    try {
        child_process_1.default.execSync(command, { stdio: 'pipe' });
    }
    catch (e) {
        console.log('STDERR: ', e);
    }
}
exports.default = default_1;
//# sourceMappingURL=execShell.js.map