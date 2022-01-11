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

class AmazonCreate {
	parent: Amazon;

	constructor(parent: Amazon) {
		this.parent = parent;
	}

	create(properties: AWSServiceParameter<AWSTypes>, type: AWSTypes) {
		const counter = this.parent.services.filter(service => service.name == properties.name && service.type == type);
	
		const baseKey = `aws_${type.toLowerCase()}`;
		const baseName = properties.name && properties.name.length > 0 ? `_${properties.name}` : '';
		const baseRank = counter.length ? `_${counter.length}` : '';

		const key = `${baseKey}${baseName}${baseRank}`;

		this.parent.services.push({
			...properties,
			type,
			key
		});
	
		return key;
	}

	s3(properties: AWSServiceParameter<'S3'>) {
		return this.create(properties, 'S3');
	}
	
	ses(properties: AWSServiceParameter<'SES'>) {
		return this.create(properties, 'SES');
	}
	
	mediaConvert(properties: AWSServiceParameter<'MEDIA_CONVERT'>) {
		return this.create(properties, 'MEDIA_CONVERT');
	}
}

class Amazon {
	services: AWSService<AWSTypes>[];

	constructor() {
		this.services = [];
	}

	find(key: string) {
		const availables = this.services.filter(service => (typeof key == 'string' ? [ key ] : key).includes(service.key));

		if (!availables.length) return (null);

		return availables;
	}

	get create() {
		return new AmazonCreate(this);
	}
}

export default new Amazon();