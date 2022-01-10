interface AWSCredentials {
	region: string;
	accessKeyid: string;
	secretAccessKey: string;
}

interface AWSProperties {
	[x: string]: number | string;
}

interface InitSES {
	addresses: {
		[x: string]: string;
	};
}

interface InitS3 {}

interface InitMediaConvert {}


type AWSTypes = 'S3' | 'SES' | 'MEDIA_CONVERT';

type AWSInits<T> =
	T extends 'S3' ? InitS3 :
	T extends 'SES' ? InitSES :
	T extends 'MEDIA_CONVERT' ? InitMediaConvert :
	object;

interface AWSService<T> {
	fields: AWSInits<T>;
	type: T;
	key: string;
	name: string;
	credentials: AWSCredentials;
	properties: AWSProperties;
}


export default ((__services: AWSService<AWSTypes>[]) => {
	const __create = (properties: Omit<AWSService<AWSTypes>, 'key' | 'type'>, type: AWSTypes): string => {
		const identical = __services.filter(cluster => cluster.name == properties.name && cluster.type == type);

		const key = `aws_${type.toLowerCase()}${properties.name && properties.name.length > 0 ? `_${properties.name}` : ''}${identical.length ? `_${identical.length}` : ''}`;

		__services.push({
			...properties,
			type,
			key
		});

		return key;
	}

	return {
		create: {
			s3: (properties: Omit<AWSService<'S3'>, "key" | "type">) => __create(properties, 'S3'),
			ses: (properties: Omit<AWSService<'SES'>, "key" | "type">) => __create(properties, 'SES'),
			mediaConvert: (properties: Omit<AWSService<'MEDIA_CONVERT'>, "key" | "type">) => __create(properties, 'MEDIA_CONVERT'),
		},
		find: (key: string) => {
			const availables = __services.filter(cluster => cluster.key == key);

			return availables.length ? availables[0] : null;
		}
	};
})([])