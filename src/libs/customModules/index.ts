export default (key: string) => {
	let imported = null;

	try {
		imported = require(`./${key}`);
	} catch (e) {
		console.log(e);

		if (e instanceof Error) {
			console.log('GUY 2: ', e);
		}
	}

	return imported;
}