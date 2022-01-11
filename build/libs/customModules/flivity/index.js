"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.database = exports.secrets = exports.amazon = exports.server = exports.clusters = void 0;
const amazon_1 = __importDefault(require("./amazon"));
const database_1 = __importDefault(require("./database"));
const secrets_1 = __importDefault(require("./secrets"));
const clusters_1 = __importDefault(require("./clusters"));
const server_1 = __importDefault(require("./server"));
exports.clusters = clusters_1.default;
exports.server = server_1.default;
exports.amazon = amazon_1.default;
exports.secrets = secrets_1.default;
exports.database = database_1.default;
//# sourceMappingURL=index.js.map