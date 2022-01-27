"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = require("aws-sdk");
class ec2 {
    constructor() {
        this.getEC2 = this.getEC2.bind(this);
        this.getLaunchTemplateID = this.getLaunchTemplateID.bind(this);
        this.runInstanceFromTemplate = this.runInstanceFromTemplate.bind(this);
        this.getInstanceInformation = this.getInstanceInformation.bind(this);
    }
    getEC2(region) {
        return new aws_sdk_1.EC2({ region });
    }
    async getLaunchTemplateID(region, LaunchTemplateName) {
        return new Promise((resolve, reject) => {
            this.getEC2(region).describeLaunchTemplates({
                Filters: [
                    {
                        Name: 'launch-template-name',
                        Values: [LaunchTemplateName]
                    }
                ]
            }, function (err, data) {
                if (err)
                    return reject(err);
                if (!('LaunchTemplates' in data
                    && Array.isArray(data.LaunchTemplates)
                    && data.LaunchTemplates.length == 1))
                    return reject(new Error(`Launch template '${LaunchTemplateName}' is unknown.`));
                const templateID = data.LaunchTemplates[0].LaunchTemplateId;
                if (!templateID)
                    return reject(new Error(`Launch template '${LaunchTemplateName}' doesn't have a templateID.`));
                return resolve(templateID);
            });
        });
    }
    async runInstanceFromTemplate(region, LaucnhTemplateID) {
        return new Promise((resolve, reject) => {
            this.getEC2(region).runInstances({
                LaunchTemplate: {
                    LaunchTemplateId: LaucnhTemplateID
                },
                MaxCount: 1,
                MinCount: 1
            }, function (err, data) {
                if (err)
                    return reject(err);
                const instances = data.Instances;
                if (!(instances
                    && instances.length == 1
                    && instances[0].InstanceId))
                    return reject(new Error(`Failed to create instance.`));
                return resolve(instances[0].InstanceId);
            });
        });
    }
    async getInstanceInformation(region, InstanceID) {
        return new Promise((resolve, reject) => {
            this.getEC2(region).describeInstances({
                InstanceIds: [InstanceID]
            }, function (err, data) {
                var _a;
                if (err)
                    return reject(err);
                const reservations = data.Reservations;
                if (!(reservations
                    && reservations.length == 1
                    && ((_a = reservations[0].Instances) === null || _a === void 0 ? void 0 : _a.length)))
                    return reject(new Error(`Failed to create instance.`));
                return resolve(reservations[0].Instances[0]);
            });
        });
    }
    async getInstanceDNSName(region, InstanceID) {
        var _a, _b;
        const instanceData = await this.getInstanceInformation(region, InstanceID);
        if (!(((_a = instanceData.State) === null || _a === void 0 ? void 0 : _a.Code)
            && ((_b = instanceData.State) === null || _b === void 0 ? void 0 : _b.Code) == 16
            && instanceData.PublicDnsName
            && instanceData.PublicDnsName.length)) {
            function sleep(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            }
            await sleep(1000);
            return await this.getInstanceDNSName(region, InstanceID);
        }
        return instanceData.PublicDnsName;
    }
}
exports.default = new ec2();
//# sourceMappingURL=index.js.map