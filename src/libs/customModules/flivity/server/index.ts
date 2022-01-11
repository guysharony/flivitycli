type ServerModes = 'development' | 'production' | 'deploy';


class Server {
	private _domain: string;
	private _mode: ServerModes;

	constructor() {
		this._domain = 'https://localhost';
		this._mode = 'development';
	}

	set domain(value: string) {
		this._domain = value;
	}

	get domain() {
		return this._domain;
	}

	set mode(value: ServerModes) {
		this._domain = value;
	}

	get mode() {
		return this._mode;
	}
}

export default new Server();