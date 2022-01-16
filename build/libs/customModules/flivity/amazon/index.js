"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const secrets_1 = __importDefault(require("./secrets"));
;
class Amazon {
    constructor() {
        this._zone = {
            city: 'paris',
            region: 'eu-west-3'
        };
    }
    get zone() {
        return this._zone;
    }
    get secrets() {
        return {
            database: secrets_1.default.database
        };
    }
}
exports.default = new Amazon();
//# sourceMappingURL=index.js.map