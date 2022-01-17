"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const elbv2_1 = __importDefault(require("./elbv2"));
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
    async secrets(name, secret) {
        return (await secrets_1.default.find(secret ? secret : 'database/credentials', name));
    }
    async elbv2(name, region) {
        const elbvalue = await elbv2_1.default.find(region ? region : this.zone.region, name);
        return elbvalue.DNSName;
    }
}
exports.default = new Amazon();
//# sourceMappingURL=index.js.map