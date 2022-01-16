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
}

export default new Amazon();