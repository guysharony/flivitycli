export default (key: string) => {
	let imported = null;

	try {
		imported = require(`./${key}`);
	} catch (e) {
		throw new Error(`unknown module '${key}'`);
	}

	return imported;
}