import { Command } from 'commander';


const program = new Command();


export default {
	create: async (key) => {
		const props = await import(`./${key}/index.js`);

		if (!props)
			throw new Error('Command not found');

		const { name, params, options=[], description, action } = props;

		const current = program.command(`${name}${params ? ` ${params}` : ''}`);

		options.map(({ flags, description, defaultValue = null }) => {
			if (!defaultValue) return current.option(flags, description);

			return current.option(flags, description, defaultValue);
		});

		current.description(description);
		current.action(() => action(current));
	},
	execute: () => {
		program.parse(process.argv);
	}
};