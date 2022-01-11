import { FunctionType } from "../../types";

interface Server {
	host: FunctionType<string>;
	port: FunctionType<number>;
	properties: {
		max_connections: FunctionType<number>;
		max_wal_senders: FunctionType<number>;
	};
}

interface Credentials {
	user: FunctionType<string>;
	password: FunctionType<string>;
	host: FunctionType<string>;
	port: FunctionType<number>;
}

interface Database {
	name: FunctionType<string>;
	server: Server;
	credentials: {
		postgres: Credentials;
		replication?: Credentials;
	}
}

class Database {
	databases: Database[];

	constructor() {
		this.databases = [];
	}

	create(properties: Database) {
		const name = properties.name instanceof Function ? properties.name() : properties.name;

		if (this.find(name))
			throw new Error(`Database '${name}' already exist.`);

		this.databases.push(properties);

		return name;
	}

	find(name: string): Database | null {
		const items = this.databases.filter(database => database.name instanceof Function ? database.name() : database.name == name);

		return items.length ? items[0] : null;
	}
}

export default new Database();