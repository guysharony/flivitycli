import { EC2 } from 'aws-sdk';


class ec2 {
	constructor() {
		this.getEC2 = this.getEC2.bind(this);
		this.getLaunchTemplateID = this.getLaunchTemplateID.bind(this);
		this.runInstanceFromTemplate = this.runInstanceFromTemplate.bind(this);
		this.getInstanceInformation = this.getInstanceInformation.bind(this);
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

	async runInstanceFromTemplate(region: string, LaucnhTemplateID: string): Promise<string> {
		return new Promise((resolve, reject) => {
			this.getEC2(region).runInstances({
				LaunchTemplate: {
					LaunchTemplateId: LaucnhTemplateID
				},
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
}

export default new ec2();