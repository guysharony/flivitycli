const merge = (target, source) => {
	const isObject = (value) => {
		return value && value instanceof Object && !(value instanceof Array);
	}

	return JSON.parse(JSON.stringify({ ...target, ...source }), (key, value) => {
		if (isObject(target[key]) && isObject(value)) return merge(target[key], value);

		return value;
	})
}

console.log(merge(
	{
		name: 'target',
		properties: {
			test: 'guy',
			test2: 'lol1',
			tester: 'guyer',
			arr: [
				'guy',
				'tom',
				'ron'
			]
		}
	},
	{
		name: 'source',
		test: 'lol',
		properties: {
			test: 'guy',
			test2: 'lol2',
			arr: [
				'guy',
				{
					name: 'tommy'
				},
				'ron'
			]
		}
	}
));