import AWS from "aws-sdk";


interface Secret {
	[x: string]: any
}

class elbv2 {
	private _elbv2: Secret | null;

	constructor() {
		this._elbv2 = null;

		this.getLoadBalancers = this.getLoadBalancers.bind(this);
		this.find = this.find.bind(this);
	}

	async getLoadBalancers(region: string): Promise<{ [x: string]: any }> {
		return new Promise((resolve, reject) => {
			try {
				const client = new AWS.ELBv2({ region });
		
				client.describeLoadBalancers({}, function(err, data) {
					if (err) {
						throw err;
					} else {
						const lb = data.LoadBalancers;

						if (!lb) throw new Error("No load balancers found.");

						return resolve(lb.reduce((obj: { [x: string]: any }, item) => {
							const { LoadBalancerName, ...loadBalancerValue } = item;

							obj[LoadBalancerName || `${region}_${lb.indexOf(item)}`] = loadBalancerValue;

							return (obj);
						}, {}));
					}
				});
			} catch (e) {
				return reject(e);
			}
		});
	}

	async find(key: string, name: string): Promise<{ [x: string]: any }> {
		if (!this._elbv2) this._elbv2 = {};

		if (!(key in this._elbv2)) this._elbv2[key] = await this.getLoadBalancers(key);

		return this._elbv2[key][name];
	}
}

export default new elbv2();