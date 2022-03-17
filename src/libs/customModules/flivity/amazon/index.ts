import elbv2 from './elbv2';
import secrets from './secrets';
import mediaConvert from './mediaConvert';
import s3 from './s3';
import ec2 from './ec2';


interface Zone {
	city: string;
	color: 'green' | 'blue' | 'white';
	region: string;
};

class Amazon {
	private _zone: Zone;
	private _zones: { [x: string]: any };

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

		this._zone = {
			region,
			...(this._zones[region])
		};

		this.elbv2 = this.elbv2.bind(this);
	}

	get zone() {
		return this._zone;
	}

	set region(value: string) {
		if (!(value in this._zones))
			throw new Error(`The region '${value}' is unknown.`)

		this._zone = {
			region: value,
			...(this._zones[value])
		};
	}

	get zones() {
		return this._zones;
	}

	async secrets(name: string) {
		return (await secrets.find(name));
	}

	async elbv2(name: string, region?: string) {
		const elbvalue = await elbv2.find(region ? region : this.zone.region, name);

		return elbvalue.DNSName;
	}

	async mediaConvert(region?: string) {
		const elbvalue = await mediaConvert.find(region ? region : this.zone.region);

		return elbvalue;
	}

	get s3() {
		return s3;
	}

	get ec2() {
		return ec2;
	}
}

export default new Amazon();