import { Command } from 'commander';

export const name = 'auth';

export const options = [
	{
		flags: '-l, --login <string>',
		description: 'aws user login',
		required: true
	},
	{
		flags: '-p, --password <string>',
		description: 'aws user password'
	}
];

export const description = 'Authenticating to aws account.';

export const action = (params: Command) => {
	const currentOptions = params.opts();
};