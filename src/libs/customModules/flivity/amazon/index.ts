import elbv2 from './elbv2';
import secrets from './secrets';


interface Zone {
	city: string;
	region: string;
};

class Amazon {
	private _zone: Zone;

	constructor() {
		this._zone = {
			city: 'paris',
			region: 'eu-west-3'
		};
	}

	get zone() {
		return this._zone;
	}

	async secrets(name: string, secret?: string) {
		return (await secrets.find(secret ? secret : 'database/credentials', name));
	}

	async elbv2(name: string, region?: string) {
		const elbvalue = await elbv2.find(region ? region : this.zone.region, name);

		return elbvalue.DNSName;
	}
}

export default new Amazon();