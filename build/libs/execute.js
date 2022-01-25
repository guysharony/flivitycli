"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = __importDefault(require("child_process"));
async function default_1(command) {
    return child_process_1.default.execSync(command).toString();
}
exports.default = default_1;
//# sourceMappingURL=execute.js.map