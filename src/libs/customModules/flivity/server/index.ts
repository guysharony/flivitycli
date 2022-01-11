import { networkInterfaces } from 'os';

type ServerModes = 'development' | 'production' | 'deploy';

const localIP = (() => {
	const nets = networkInterfaces();
	const results = Object.create(null);

	for (const name of Object.keys(nets)) {
		const current = nets[name];

		if (current) {
			for (const net of current) {
				if (net.family === 'IPv4' && !net.internal) {
					if (!results[name])
						results[name] = [];

					results[name].push(net.address);
				}
			}
		}
	}
})();

class Server {
	private _domain: string;
	private _mode: ServerModes;

	constructor() {
		this._domain = '';
		this._mode = 'development';
	}

	set domain(value: string) {
		this._domain = value;
	}

	get domain() {
		return this._domain;
	}

	get localIP() {
		return localIP;
	}

	set mode(value: ServerModes) {
		this._mode = value;
	}

	get mode() {
		return this._mode;
	}
}

export default new Server();