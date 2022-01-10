interface AWSCredentials {
	region: string;
	accessKeyid: string;
	secretAccessKey: string;
}

interface AWSProperties {
	[x: string]: number | string;
}

interface InitSES {
	type: 'SES';
	name: string;
	crefentials: AWSCredentials;
	addresses: {
		[x: string]: string;
	};
	properties: AWSProperties;
}

type AWSServices = Array<InitSES>;


export default ((__services: AWSServices) => {
	return {
		create: {
			ses: (properties: InitSES) => {
				if (__services.filter(cluster => cluster.name == properties.name && cluster.type == 'SES').length)
					throw new Error(`Cluster '${properties.name}' already exist.`);
	
					__services.push({
					...properties,
					type: 'SES'
				});
			}
		},
		find: (name: string) => {
			const availables = __services.filter(cluster => cluster.name == name && cluster.type == 'SES');

			return availables.length ? availables[0] : null;
		}
	};
})([])