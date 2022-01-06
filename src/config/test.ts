interface PropertiesConfig {
	[x: string]: any;
}

export interface ProfileConfig {
	name: string;
	properties: PropertiesConfig
}

export interface TestConfig {
	inputDir: string;
	outputDir?: string;
	profiles?: ProfileConfig[]
}