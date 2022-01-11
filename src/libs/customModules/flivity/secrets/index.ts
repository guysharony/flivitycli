import { FunctionType } from "../../types"


interface Secret {
	name: FunctionType<string>;
	properties: {
		value: FunctionType<string>;
		duration: FunctionType<number>;
		interval?: FunctionType<number>;
	};
}

class Secrets {
	secrets: Secret[];

	constructor() {
		this.secrets = [];
	}

	create(properties: Secret) {
		const name = properties.name instanceof Function ? properties.name() : properties.name;

		if (this.find(name))
			throw new Error(`Secret '${name}' already exist.`);

		this.secrets.push(properties);

		return name;
	}

	find(name: string) {
		const items = this.secrets.filter(secret => (secret.name instanceof Function ? secret.name() : secret.name) == name);

		return items.length ? items[0] : null;
	}
}

export default new Secrets();