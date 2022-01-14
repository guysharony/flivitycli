import { networkInterfaces } from 'os';

type ServerModes = 'development' | 'production' | 'deploy';

const localIP = (() => {
	const nets = networkInterfaces();
	const results: { [x: string]: any } = {};

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

	return (results);
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
		try {
			return localIP.en1[0];
		} catch (e) {
			throw new Error(`You are not connected to the internet.`);
		}
	}

	set mode(value: ServerModes) {
		this._mode = value;
	}

	get mode() {
		return this._mode;
	}
}

export default new Server();