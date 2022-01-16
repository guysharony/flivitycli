import AWS from "aws-sdk";


interface Secret {
	[x: string]: any
}

class elbv2 {
	private _elbv2: Secret | null;

	constructor() {
		this._elbv2 = null;

		this.init = this.init.bind(this);
		this.getLoadBalancers = this.getLoadBalancers.bind(this);
		this.find = this.find.bind(this);
	}

	async init() {
		try {
			const regions = [ 'us-west-2', 'eu-west-3' ];

			for (const region in regions) {
				if (!this._elbv2) this._elbv2 = {};

				this._elbv2[regions[region]] = await this.getLoadBalancers(regions[region]);
			}
		} catch (e) {
			console.log(e);
			return;
		}
	}

	async getLoadBalancers(region: string) {
		return new Promise((resolve, reject) => {
			try {
				const client = new AWS.ELBv2({ region });
		
				client.describeLoadBalancers({}, function(err, data) {
					if (err) {
						throw err;
					} else {
						const lb = data.LoadBalancers;

						if (!lb) throw new Error("No load balancers found.");

						return resolve(lb.reduce((obj: { [x: string]: any }, item) => (obj[item.LoadBalancerName || `${region}_${lb.indexOf(item)}`] = item.DNSName, obj), {}));
					}
				});
			} catch (e) {
				return reject(e);
			}
		});
	}

	find(key: string) {
		if (!this._elbv2) throw new Error("Amazon Web Service authentication is required for Elastic Load Balancers.");

		return this._elbv2[key];
	}
}

export default new elbv2();