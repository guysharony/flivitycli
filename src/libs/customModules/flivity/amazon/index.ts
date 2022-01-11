import { FunctionType } from "../../types";

interface AWSCredentials {
	region: FunctionType<string>;
	accessKeyid: FunctionType<string>;
	secretAccessKey: FunctionType<string>;
}

interface AWSProperties {
	[x: string]: FunctionType<string | number>;
}

interface InitSES {
	addresses: {
		[x: string]: FunctionType<string>;
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
	key: FunctionType<string>;
	name: FunctionType<string>;
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

	get zone() {
		return {
			city: 'paris',
			region: 'eu-west-3'
		};
	}

	find(key: string | string[]) {
		const availables = this.services.filter(service => (typeof key == 'string' ? [ key ] : key).includes(service.key instanceof Function ? service.key() : service.key));

		if (!availables.length) return (null);

		return availables.reduce((obj: { [x: string]: Omit<AWSService<AWSTypes>, 'key'> }, item) => (obj[item.key instanceof Function ? item.key() : item.key] = (({ key, ...o }) => o)(item), obj) ,{});
	}

	get create() {
		return new AmazonCreate(this);
	}
}

export default new Amazon();