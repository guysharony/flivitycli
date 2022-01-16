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

	get secrets() {
		return {
			database: secrets.database
		};
	}

	elbv2(name: string, region?: string) {
		return elbv2.find(region ? region : this.zone.region)[name];
	}
}

export default new Amazon();