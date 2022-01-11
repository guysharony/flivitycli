import { FunctionType } from "../../types";

interface Server {
	host: FunctionType<string>;
	port: FunctionType<string | number>;
};

interface Properties {
	[x: string]: any;
};

interface Service {
	name: FunctionType<string>;
	server: Server;
	entry: FunctionType<string>;
	properties: Properties;
};


interface Cluster {
	name: FunctionType<string>;
	properties: Properties;
	services: Service[]
}


class Clusters {
	clusters: Cluster[];

	constructor() {
		this.clusters = [];
	}

	find(name: string) {
		const items = this.clusters.filter(cluster => (cluster.name instanceof Function ? cluster.name() : cluster.name) == name);

		return items.length ? items[0] : null;
	}

	create(properties: Cluster) {
		if (this.find(properties.name instanceof Function ? properties.name() : properties.name))
			throw new Error(`Cluster '${properties.name}' already exist.`);

		this.clusters.push(properties);
	}
}

export default new Clusters();