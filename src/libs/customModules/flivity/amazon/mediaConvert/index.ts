import AWS from "aws-sdk";


interface media {
	[x: string]: any
}

class mediaConvert {
	private _mediaConvert: media | null;

	constructor() {
		this._mediaConvert = null;

		this.getMediaConvert = this.getMediaConvert.bind(this);
		this.find = this.find.bind(this);
	}

	async getMediaConvert(region: string): Promise<string> {
		const client = new AWS.MediaConvert({ region });
		
		const endpoints = await client.describeEndpoints({ MaxResults: 0 }).promise();

		const endpoint = endpoints.Endpoints;
		if (!(endpoint && endpoint.length && endpoint[0].Url)) throw new Error(`unable to get MediaConvert endpoint for region '${region}'.`);

		return endpoint[0].Url;
	}

	async find(region: string): Promise<{ [x: string]: any }> {
		if (!this._mediaConvert) this._mediaConvert = {};

		if (!(region in this._mediaConvert)) this._mediaConvert[region] = await this.getMediaConvert(region);

		return this._mediaConvert[region];
	}
}

export default new mediaConvert();