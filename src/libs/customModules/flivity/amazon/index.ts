import elbv2 from './elbv2';
import secrets from './secrets';
import mediaConvert from './mediaConvert';


interface Zone {
	city: string;
	region: string;
};

class Amazon {
	private _zone: Zone;
	private _zones: { [x: string]: any };

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

		this._zone = {
			region,
			...(this._zones[region])
		};
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

	async secrets(name: string, secret?: string) {
		return (await secrets.find(secret ? secret : 'database/credentials', name));
	}

	async elbv2(name: string, region?: string) {
		const elbvalue = await elbv2.find(region ? region : this.zone.region, name);

		return elbvalue.DNSName;
	}

	async mediaConvert(region?: string) {
		const elbvalue = await mediaConvert.find(region ? region : this.zone.region);

		return elbvalue;
	}
}

export default new Amazon();