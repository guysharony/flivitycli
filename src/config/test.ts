interface ConfigProperties {
	[x: string]: any;
}

interface Config {
	name: string;
	properties: ConfigProperties
}

type Configs = Config[];


let configs: Configs = [
	{
		name: 'dev',
		properties: {
			host: 'https://localhost'
		}
	},
	{
		name: 'prod',
		properties: {
			host: 'https://flivity.com'
		}
	}
];

export const find = (name: string) => {
	const config = configs.filter(config => config.name == name);

	if (!config.length) return (null);

	return (config[0]);
}