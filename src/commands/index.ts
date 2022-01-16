import { program, CommandDefinition } from "../libs/commands";

const importCommand = (key: string) => {
	let command = null;

	try {
		command = require(`./${key}`);
	} catch (e) {
		return (command);
	}

	return (command);
}

export const create = async (key: string) => {
	const command = importCommand(key);

	if (!command) {
		console.log(`flivitycli: '${key}' is not a flivitycli command.`);
		console.log(`See 'flivitycli --help'`);
		return;
	}

	const { name, options, description, action }: CommandDefinition = command;

	const current = program.command(`${name}`);

	if (options) {
		options.map(({ flags, description, defaultValue = null, required = false }) => {
			if (!defaultValue) {
				if (required) return current.requiredOption(flags, description);

				return current.option(flags, description);
			}

			if (required) {
				throw new Error("A required option can't have a default value.");
			}

			return current.option(flags, description, defaultValue);
		});
	}

	current.description(description);
	current.action(() => action(current));
}

export const name = (params: string) => {
	program.name(params);
}

export const usage = (params: string) => {
	program.usage(params);
}

export const execute = () => {
	program.configureOutput({
		writeOut: (str) => process.stdout.write(`${str}`),
		writeErr: (str) => process.stdout.write(`${str}`),
		outputError: (str) => {
			if (program.args.length) {
				console.log(str.replace("error: ", "flivitycli: "));
				console.log(`See 'flivitycli --help'`);
			}
		}
	});

	program.parse(process.argv);
}