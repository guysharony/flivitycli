export default (key: string) => {
	let imported = null;

	try {
		imported = require(`./${key}`);
	} catch (e) {
		console.log(e);
	}

	return imported;
}