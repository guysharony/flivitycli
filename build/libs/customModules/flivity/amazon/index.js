"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const elbv2_1 = __importDefault(require("./elbv2"));
const secrets_1 = __importDefault(require("./secrets"));
const mediaConvert_1 = __importDefault(require("./mediaConvert"));
;
class Amazon {
    constructor() {
        this._zones = {
            'us-west-2': {
                city: 'oregon',
                master: true
            },
            'eu-west-3': {
                city: 'paris',
                master: false
            }
        };
        const region = 'AWS_DEFAULT_REGION' in process.env && process.env.AWS_DEFAULT_REGION && process.env.AWS_DEFAULT_REGION in this._zones ? process.env.AWS_DEFAULT_REGION : 'us-west-2';
        this._zone = Object.assign({ region }, (this._zones[region]));
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
    async mediaConvert(region) {
        const elbvalue = await mediaConvert_1.default.find(region ? region : this.zone.region);
        return elbvalue;
    }
}
exports.default = new Amazon();
//# sourceMappingURL=index.js.map