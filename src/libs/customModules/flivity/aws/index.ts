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

type AWSInits<T> =
	T extends 'S3' ? InitS3 :
	T extends 'SES' ? InitSES :
	T extends 'MEDIA_CONVERT' ? InitMediaConvert :
	object;

type AWSTypes = 'S3' | 'SES' | 'MEDIA_CONVERT';

type AWSServiceBase<T extends {}> = T & {
	type: T;
	key: string;
	name: string;
	credentials: AWSCredentials;
	properties: AWSProperties;
};

type AWSService<T extends {}> = AWSServiceBase<AWSInits<T>>;

type AWSServiceParameter<T extends {}> = Omit<AWSServiceBase<AWSInits<T>>, 'key' | 'type'>;


export default ((__services: AWSService<AWSTypes>[]) => {
	const __create = (properties: AWSServiceParameter<AWSTypes>, type: AWSTypes): string => {
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
			s3: (properties: AWSServiceParameter<'S3'>) => __create(properties, 'S3'),
			ses: (properties: AWSServiceParameter<'SES'>) => __create(properties, 'SES'),
			mediaConvert: (properties: AWSServiceParameter<'MEDIA_CONVERT'>) => __create(properties, 'MEDIA_CONVERT'),
		},
		find: (key: string | string[]) => {
			const availables = __services.filter(cluster => (typeof key == 'string' ? [ key ] : key).includes(cluster.key));

			if (!availables.length) return (null);

			return availables;
		}
	};
})([])