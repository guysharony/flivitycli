"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const elbv2_1 = __importDefault(require("./elbv2"));
const secrets_1 = __importDefault(require("./secrets"));
const mediaConvert_1 = __importDefault(require("./mediaConvert"));
const s3_1 = __importDefault(require("./s3"));
const ec2_1 = __importDefault(require("./ec2"));
;
class Amazon {
    constructor() {
        this._zones = {
            'us-west-2': {
                city: 'oregon',
                color: 'green',
                master: true
            },
            'eu-west-3': {
                city: 'paris',
                color: 'blue',
                master: false
            }
        };
        const region = 'AWS_DEFAULT_REGION' in process.env && process.env.AWS_DEFAULT_REGION && process.env.AWS_DEFAULT_REGION in this._zones ? process.env.AWS_DEFAULT_REGION : 'us-west-2';
        this._zone = Object.assign({ region }, (this._zones[region]));
        this.elbv2 = this.elbv2.bind(this);
    }
    get zone() {
        return this._zone;
    }
    set region(value) {
        if (!(value in this._zones))
            throw new Error(`The region '${value}' is unknown.`);
        this._zone = Object.assign({ region: value }, (this._zones[value]));
    }
    get zones() {
        return this._zones;
    }
    async secrets(name) {
        return (await secrets_1.default.find(name));
    }
    async elbv2(name, region) {
        const elbvalue = await elbv2_1.default.find(region ? region : this.zone.region, name);
        return elbvalue.DNSName;
    }
    async mediaConvert(region) {
        const elbvalue = await mediaConvert_1.default.find(region ? region : this.zone.region);
        return elbvalue;
    }
    get s3() {
        return s3_1.default;
    }
    get ec2() {
        return ec2_1.default;
    }
}
exports.default = new Amazon();
//# sourceMappingURL=index.js.map