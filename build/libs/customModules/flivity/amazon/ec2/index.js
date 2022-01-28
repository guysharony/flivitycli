"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const tmp_1 = __importDefault(require("tmp"));
const execs = __importStar(require("../../../../../libs/execs"));
const aws_sdk_1 = require("aws-sdk");
class KeyPair {
    constructor(keyName, keyValue, deleteCallback) {
        this.keyName = keyName;
        this.keyValue = keyValue;
        this.deleteCallback = deleteCallback;
        this.temporarySSHKey = tmp_1.default.fileSync();
        fs_1.default.writeFileSync(this.temporarySSHKey.name, this.keyValue);
        this.delete = this.delete.bind(this);
    }
    get name() {
        return this.keyName;
    }
    get path() {
        return this.temporarySSHKey.name;
    }
    async delete() {
        this.temporarySSHKey.removeCallback();
        await this.deleteCallback();
    }
}
class ec2 {
    constructor() {
        this.getEC2 = this.getEC2.bind(this);
        // Launch templates
        this.getLaunchTemplateID = this.getLaunchTemplateID.bind(this);
        // Key pairs
        this.createKeyPair = this.createKeyPair.bind(this);
        this.deleteKeyPair = this.deleteKeyPair.bind(this);
        // Instances
        this.createInstanceImage = this.createInstanceImage.bind(this);
        this.isInstanceAvailable = this.isInstanceAvailable.bind(this);
        this.runInstanceFromTemplate = this.runInstanceFromTemplate.bind(this);
        this.waitForInstanceAvailable = this.waitForInstanceAvailable.bind(this);
        this.getInstanceInformation = this.getInstanceInformation.bind(this);
        this.getInstanceDNSName = this.getInstanceDNSName.bind(this);
        this.deleteInstance = this.deleteInstance.bind(this);
        // Images
        this.createImageFromInstance = this.createImageFromInstance.bind(this);
        this.waitForImageAvailable = this.waitForImageAvailable.bind(this);
        this.isImageAvailable = this.isImageAvailable.bind(this);
        this.deleteImage = this.deleteImage.bind(this);
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
    async runInstanceFromTemplate(region, LaucnhTemplateID, KeyName) {
        return new Promise((resolve, reject) => {
            this.getEC2(region).runInstances(Object.assign(Object.assign({ LaunchTemplate: {
                    LaunchTemplateId: LaucnhTemplateID
                } }, (KeyName ? { KeyName } : {})), { MaxCount: 1, MinCount: 1 }), function (err, data) {
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
        var _a, _b, _c, _d;
        const instanceData = await this.getInstanceInformation(region, InstanceID);
        if (!(((_a = instanceData.State) === null || _a === void 0 ? void 0 : _a.Code)
            && ((_b = instanceData.State) === null || _b === void 0 ? void 0 : _b.Code) == 16
            && instanceData.PublicDnsName
            && instanceData.PublicDnsName.length)) {
            if (((_c = instanceData.State) === null || _c === void 0 ? void 0 : _c.Code)
                && ((_d = instanceData.State) === null || _d === void 0 ? void 0 : _d.Code) > 16)
                throw new Error(`Instance ${InstanceID} is not running.`);
            function sleep(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            }
            await sleep(1000);
            return await this.getInstanceDNSName(region, InstanceID);
        }
        return instanceData.PublicDnsName;
    }
    async deleteKeyPair(region, KeyName) {
        return new Promise((resolve, reject) => {
            this.getEC2(region).deleteKeyPair({
                KeyName
            }, function (err, data) {
                if (err)
                    return reject(err);
                return resolve(data);
            });
        });
    }
    async createKeyPair(region, KeyName) {
        return new Promise(async (resolve, reject) => {
            const resolver = (data) => {
                const material = data.KeyMaterial;
                const pairId = data.KeyPairId;
                if (!(material && pairId))
                    throw new Error('Error in creating Key Pair.');
                return resolve((new KeyPair(KeyName, material, async () => {
                    await this.deleteKeyPair(region, KeyName);
                })));
            };
            const syncCreateKeyPair = async () => {
                return new Promise((resolveSyncKey, rejectSyncKey) => {
                    this.getEC2(region).createKeyPair({ KeyName }, (err, data) => {
                        if (err)
                            return rejectSyncKey(err);
                        return resolver(data);
                    });
                });
            };
            try {
                await syncCreateKeyPair();
            }
            catch (e) {
                if (e.code) {
                    if (e.code == 'InvalidKeyPair.Duplicate') {
                        await this.deleteKeyPair(region, KeyName);
                        return await syncCreateKeyPair();
                    }
                }
                return reject(e);
            }
        });
    }
    async deleteInstance(region, InstanceId) {
        return new Promise((resolve, reject) => {
            this.getEC2(region).terminateInstances({
                InstanceIds: [InstanceId]
            }, function (err, data) {
                if (err)
                    return reject(err);
                return resolve(data);
            });
        });
    }
    async createImageFromInstance(region, Name, InstanceId) {
        return new Promise((resolve, reject) => {
            this.getEC2(region).createImage({
                InstanceId,
                Name,
                NoReboot: true
            }, (err, data) => {
                if (err)
                    return reject(err);
                const image_id = data.ImageId;
                if (!image_id)
                    throw new Error(`Couldn't create image.`);
                return resolve(image_id);
            });
        });
    }
    async isImageAvailable(region, ImageId) {
        return new Promise((resolve, reject) => {
            this.getEC2(region).describeImages({
                ImageIds: [ImageId]
            }, (err, data) => {
                if (err)
                    return reject(err);
                const images = data.Images;
                if (!(images && images.length))
                    throw new Error(`Couldn't retreive images.`);
                const state = images[0].State;
                return resolve(state && (state == 'available'));
            });
        });
    }
    async deleteImage(region, ImageId) {
        return new Promise((resolve, reject) => {
            this.getEC2(region).deregisterImage({
                ImageId
            }, (err, data) => {
                if (err)
                    return reject(err);
                return resolve(data);
            });
        });
    }
    async waitForImageAvailable(region, ImageId) {
        const asyncFct = await execs.timer({
            delay: 900000,
            retry: {
                interval: 30000,
                max: 3
            }
        });
        return await asyncFct.call(async () => await this.isImageAvailable(region, ImageId));
    }
    async isInstanceAvailable(keyPair, DNSName) {
        const response = execs.execute(`ssh -i ${keyPair} -o StrictHostKeyChecking=accept-new ubuntu@${DNSName} 'curl -Is http://127.0.0.1 | head -n 1'`);
        if (!response)
            throw new Error(`${response}`);
        const response_split = response.split(' ');
        return (response_split.length > 2 && response_split[1] == '200' ? response : null);
    }
    async waitForInstanceAvailable(keyPair, DNSName) {
        console.log('Waiting for instances...');
        const asyncFct = await execs.timer({
            delay: 300000,
            retry: {
                interval: 30000,
                max: 3
            }
        });
        return await asyncFct.call(async () => {
            for (const region in keyPair) {
                await this.isInstanceAvailable(keyPair[region].path, DNSName[region]);
            }
        });
    }
    async createInstanceImage(params) {
        const launchTemplates = params.LaunchTemplateID;
        // Creating key paires
        const keyPairs = {};
        try {
            for (const region in launchTemplates) {
                keyPairs[region] = await this.createKeyPair(region, params.ImageName);
            }
        }
        catch (e) {
            for (const region in launchTemplates) {
                try {
                    await keyPairs[region].delete();
                }
                catch (e) { }
            }
            throw new Error('Failed creating key pairs.');
        }
        // Creating instances
        const instanceID = {};
        const instanceDNSName = {};
        try {
            for (const region in launchTemplates) {
                instanceID[region] = await this.runInstanceFromTemplate(region, launchTemplates[region], keyPairs[region].name);
                instanceDNSName[region] = await this.getInstanceDNSName(region, instanceID[region]);
            }
        }
        catch (e) {
            for (const region in launchTemplates) {
                try {
                    await this.deleteInstance(region, instanceID[region]);
                }
                catch (e) { }
                try {
                    await (keyPairs[region].delete());
                }
                catch (e) { }
            }
            throw new Error('Failed creating instance.');
        }
        // Waiting for instances
        try {
            await this.waitForInstanceAvailable(keyPairs, instanceDNSName);
        }
        catch (e) {
            for (const region in launchTemplates) {
                try {
                    await this.deleteInstance(region, instanceID[region]);
                }
                catch (e) { }
                try {
                    await (keyPairs[region].delete());
                }
                catch (e) { }
            }
            throw new Error('Failed creating instance.');
        }
        // Creating images
        const imageID = {};
        try {
            for (const region in launchTemplates) {
                imageID[region] = await this.createImageFromInstance(region, params.ImageName, instanceID[region]);
            }
        }
        catch (e) {
            for (const region in launchTemplates) {
                try {
                    await this.deleteImage(region, imageID[region]);
                }
                catch (e) { }
                try {
                    await this.deleteInstance(region, instanceID[region]);
                }
                catch (e) { }
                try {
                    await (keyPairs[region].delete());
                }
                catch (e) { }
            }
            throw new Error('Failed creating images.');
        }
        // Wait for images
        try {
            for (const region in launchTemplates) {
                await this.waitForImageAvailable(region, imageID[region]);
            }
        }
        catch (e) {
            for (const region in launchTemplates) {
                try {
                    await this.deleteImage(region, imageID[region]);
                }
                catch (e) { }
                try {
                    await this.deleteInstance(region, instanceID[region]);
                }
                catch (e) { }
                try {
                    await (keyPairs[region].delete());
                }
                catch (e) { }
            }
            throw new Error("Failed creating images from instance.");
        }
        for (const region in launchTemplates) {
            try {
                await this.deleteInstance(region, instanceID[region]);
            }
            catch (e) { }
            try {
                await (keyPairs[region].delete());
            }
            catch (e) { }
        }
        return;
    }
}
exports.default = new ec2();
//# sourceMappingURL=index.js.map