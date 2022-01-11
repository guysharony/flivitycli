import { FunctionType, ObjectMerge } from "../../types";

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

interface DatabaseBase {
	key: string;
	name: FunctionType<string>;
	server: Server;
	credentials: {
		postgres: Credentials;
		replication?: Credentials;
	}
}

type DatabaseParameter = Omit<DatabaseBase, 'key'>;


class Database {
	databases: DatabaseBase[];

	constructor() {
		this.databases = [];
	}

	create(properties: DatabaseParameter) {
		const master_name = properties.name instanceof Function ? properties.name() : properties.name;
		const master_length = this.find(master_name);
		const master_key = `${master_name}${master_length ? `_${master_length}` : ''}`;

		this.databases.push({
			...properties,
			key: master_key
		});

		return {
			replicate: (replicate: Partial<DatabaseParameter>) => {
				const replica_base = `${master_key}_replica`;
				const replicas_length = this.databases.filter(database => database.key.startsWith(replica_base));
				const replicas_key = `${replica_base}${replicas_length ? `_${replicas_length}` : ''}`;

				return {
					...<DatabaseBase>ObjectMerge(replicate, replicate),
					key: replicas_key
				};
			}
		};
	}

	find(key: string | string[]) {
		const availables = this.databases.filter(database => (typeof key == 'string' ? [ key ] : key).includes(database.key));

		if (!availables.length) return (null);

		return availables.reduce((obj: { [x: string]: Omit<DatabaseBase, 'key'> }, item) => (obj[item.key] = (({ key, ...o }) => o)(item), obj), {});
	}
}

export default new Database();