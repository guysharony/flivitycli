"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = __importDefault(require("aws-sdk"));
class mediaConvert {
    constructor() {
        this._mediaConvert = null;
        this.getMediaConvert = this.getMediaConvert.bind(this);
        this.find = this.find.bind(this);
    }
    async getMediaConvert(region) {
        const client = new aws_sdk_1.default.MediaConvert({ region });
        const endpoints = await client.describeEndpoints({ MaxResults: 0 }).promise();
        const endpoint = endpoints.Endpoints;
        if (!(endpoint && endpoint.length && endpoint[0].Url))
            throw new Error(`unable to get MediaConvert endpoint for region '${region}'.`);
        return endpoint[0].Url;
    }
    async find(region) {
        if (!this._mediaConvert)
            this._mediaConvert = {};
        if (!(region in this._mediaConvert))
            this._mediaConvert[region] = await this.getMediaConvert(region);
        return this._mediaConvert[region];
    }
}
exports.default = new mediaConvert();
//# sourceMappingURL=index.js.map