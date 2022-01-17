"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = __importDefault(require("aws-sdk"));
class elbv2 {
    constructor() {
        this._elbv2 = null;
        this.getLoadBalancers = this.getLoadBalancers.bind(this);
        this.find = this.find.bind(this);
    }
    async getLoadBalancers(region) {
        return new Promise((resolve, reject) => {
            try {
                const client = new aws_sdk_1.default.ELBv2({ region });
                client.describeLoadBalancers({}, function (err, data) {
                    if (err) {
                        throw err;
                    }
                    else {
                        const lb = data.LoadBalancers;
                        if (!lb)
                            throw new Error("No load balancers found.");
                        return resolve(lb.reduce((obj, item) => {
                            const { LoadBalancerName } = item, loadBalancerValue = __rest(item, ["LoadBalancerName"]);
                            obj[LoadBalancerName || `${region}_${lb.indexOf(item)}`] = loadBalancerValue;
                            return (obj);
                        }, {}));
                    }
                });
            }
            catch (e) {
                return reject(e);
            }
        });
    }
    async find(key, name) {
        if (!this._elbv2)
            this._elbv2 = {};
        if (!(key in this._elbv2))
            this._elbv2[key] = await this.getLoadBalancers(key);
        return this._elbv2[key][name];
    }
}
exports.default = new elbv2();
//# sourceMappingURL=index.js.map