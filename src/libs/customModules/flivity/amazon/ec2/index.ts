import fs from 'fs';
import tmp from 'tmp';
import * as execs from '../../../../../libs/execs';
import { AWSError, EC2 } from 'aws-sdk';


class KeyPair {
	private temporarySSHKey: tmp.FileResult;

	constructor(private keyName: string, private keyValue: string, private deleteCallback: () => Promise<void>) {
		this.temporarySSHKey = tmp.fileSync();
		fs.writeFileSync(this.temporarySSHKey.name, this.keyValue);

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
		this.getLaunchTemplateID = this.getLaunchTemplateID.bind(this);
		this.runInstanceFromTemplate = this.runInstanceFromTemplate.bind(this);
		this.getInstanceInformation = this.getInstanceInformation.bind(this);
		this.getInstanceDNSName = this.getInstanceDNSName.bind(this);
		this.createKeyPair = this.createKeyPair.bind(this);
		this.deleteKeyPair = this.deleteKeyPair.bind(this);

		this.createInstanceImage = this.createInstanceImage.bind(this);
		this.terminateInstance = this.terminateInstance.bind(this);

		this.createImageFromInstance = this.createImageFromInstance.bind(this);
		this.isImageAvailable = this.isImageAvailable.bind(this);
		this.waitForImageAvailable = this.waitForImageAvailable.bind(this);
	}

	getEC2(region: string) {
		return new EC2({ region })
	}

	async getLaunchTemplateID(region: string, LaunchTemplateName: string): Promise<string> {
		return new Promise((resolve, reject) => {
			this.getEC2(region).describeLaunchTemplates({
				Filters: [
					{
						Name: 'launch-template-name',
						Values: [ LaunchTemplateName ]
					}
				]
			}, function(err, data) {
				if (err) return reject(err);

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

	async runInstanceFromTemplate(region: string, LaucnhTemplateID: string, KeyName?: string): Promise<string> {
		return new Promise((resolve, reject) => {
			this.getEC2(region).runInstances({
				LaunchTemplate: {
					LaunchTemplateId: LaucnhTemplateID
				},
				...(KeyName ? { KeyName } : {}),
				MaxCount: 1,
				MinCount: 1
			}, function(err, data) {
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

	async getInstanceInformation(region: string, InstanceID: string): Promise<EC2.Instance> {
		return new Promise((resolve, reject) => {
			this.getEC2(region).describeInstances({
				InstanceIds: [ InstanceID ]
			}, function(err, data) {
				if (err)
					return reject(err);

				const reservations = data.Reservations;
				if (!(reservations
					&& reservations.length == 1
					&& reservations[0].Instances?.length))
					return reject(new Error(`Failed to create instance.`));

				return resolve(reservations[0].Instances[0]);
			});
		});
	}

	async getInstanceDNSName(region: string, InstanceID: string): Promise<string> {
		const instanceData = await this.getInstanceInformation(region, InstanceID);

		if (!(instanceData.State?.Code
			&& instanceData.State?.Code == 16
			&& instanceData.PublicDnsName
			&& instanceData.PublicDnsName.length)) {

			if (instanceData.State?.Code
				&& instanceData.State?.Code > 16)
				throw new Error(`Instance ${InstanceID} is not running.`);

			function sleep(ms: number) {
				return new Promise(resolve => setTimeout(resolve, ms));
			}

			await sleep(1000);
			return await this.getInstanceDNSName(region, InstanceID);
		}

		return instanceData.PublicDnsName;
	}

	async deleteKeyPair(region: string, KeyName: string): Promise<{}> {
		return new Promise((resolve, reject) => {
			this.getEC2(region).deleteKeyPair({
				KeyName
			}, function(err, data) {
				if (err)
					return reject(err);

				return resolve(data);
			});
		});
	}

	async createKeyPair(region: string, KeyName: string): Promise<KeyPair> {
		return new Promise(async (resolve, reject) => {
			const resolver = (data: EC2.KeyPair): void => {
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
						if (err) return rejectSyncKey(err);
	
						return resolver(data);
					});
				})
			};

			try {
				await syncCreateKeyPair();
			} catch (e: any) {
				if ((e as AWSError).code) {
					if (e.code == 'InvalidKeyPair.Duplicate') {
						await this.deleteKeyPair(region, KeyName);
	
						return await syncCreateKeyPair();
					}
				}

				return reject(e);
			}
		});
	}

	async terminateInstance(region: string, InstanceId: string) {
		return new Promise((resolve, reject) => {
			this.getEC2(region).terminateInstances({
				InstanceIds: [ InstanceId ]
			}, function(err, data) {
				if (err)
					return reject(err);

				return resolve(data);
			});
		});
	}

	async createImageFromInstance(region: string, Name: string, InstanceId: string): Promise<string> {
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
					throw new Error(`Couldn't create image.`)

				return resolve(image_id);
			});
		});
	}

	async isImageAvailable(region: string, ImageId: string) {
		return new Promise((resolve, reject) => {
			this.getEC2(region).describeImages({
				ImageIds: [ ImageId ]
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

	async waitForImageAvailable(region: string, ImageId: string) {
		try {
			function sleep(ms: number) {
				return new Promise(resolve => setTimeout(resolve, ms));
			}

			await sleep(10000);

			if (!await this.isImageAvailable(region, ImageId)) {
				throw new Error('Not ready');
			}
		} catch (e) {
			console.log('Waiting for image: ', e);
			await this.waitForImageAvailable(region, ImageId);
		}
	}


	async createInstanceImage(region: string, params: { LaunchTemplateID: string, ImageName: string }) {
		const keyPair = await this.createKeyPair(region, 'ec2-Instance-builder');

		const instanceID = await this.runInstanceFromTemplate(region, params.LaunchTemplateID, keyPair.name);
		const instanceDNSName = await this.getInstanceDNSName(region, instanceID);

		function sleep(ms: number) {
			return new Promise(resolve => setTimeout(resolve, ms));
		}

		const waitForStatus = async (delay?: number) => {
			if (delay) {
				console.log('Start waiting instance.');
				await sleep(delay);
				console.log('Stop waiting instance.');
			}

			const response = execs.execute(`ssh -i ${keyPair.path} -o StrictHostKeyChecking=accept-new ubuntu@${instanceDNSName} 'curl -Is http://127.0.0.1 | head -n 1'`);

			if (response) {
				const response_split = response.split(' ');

				if (response_split.length > 2 && response_split[1] == '200')
					return response;
			
				await waitForStatus(delay);
				return;
			}

			throw new Error(`${response}`);
		}

		try {
			await sleep(300000);
			await waitForStatus(10000);
			console.log('Creating image from instance.');
			const imageId = await this.createImageFromInstance(region, params.ImageName, instanceID);
			console.log('Waiting image to be available.');
			await this.waitForImageAvailable(region, imageId);
			console.log('Image is available');
		} catch (e) {
			console.log('CREATE_IMAGE: ', e);
		}

		await this.terminateInstance(region, instanceID);
		await keyPair.delete();

		return;
	}
}

export default new ec2();