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
	name: string;
	properties: Properties;
	services: Service[]
}


let __clusters: Cluster[] = [];


export const clusters = {
	create: (properties: Cluster) => {
		if (__clusters.filter(cluster => cluster.name == properties.name).length)
			throw new Error(`Cluster '${properties.name}' already exist.`);

		__clusters.push(properties);
	},
	find: (name: string) => {
		const availables = __clusters.filter(cluster => cluster.name == name);

		return availables.length ? availables[0] : null;
	}
}