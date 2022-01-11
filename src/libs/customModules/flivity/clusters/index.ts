interface Server {
	host: string;
	port: number | string;
};

interface Properties {
	[x: string]: any;
};

interface Service {
	name: string;
	server: Server;
	entry: string;
	properties: Properties;
};


interface Cluster {
	key: string;
	properties: Properties;
	services: Service[]
}


class Clusters {
	clusters: Cluster[];

	constructor() {
		this.clusters = [];
	}

	find(key: string) {
		const items = this.clusters.filter(cluster => cluster.key == key);

		return items.length ? items[0] : null;
	}

	create(properties: Cluster) {
		if (this.find(properties.key))
			throw new Error(`Cluster '${properties.key}' already exist.`);

		this.clusters.push(properties);
	}
}

export default new Clusters();