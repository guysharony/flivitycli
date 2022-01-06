import { Command } from 'commander';

export const name = 'auth';

export const params = '[options]';

export const options = [
	{
		flags: '-l, --login <login>',
		description: 'Amazon user login.',
		required: true
	},
	{
		flags: '-p, --password <password>',
		description: 'Amazon user password.'
	}
];

export const description = 'Authenticating to Amazon account.';

export const action = (params: Command) => {
	const currentOptions = params.opts();

	console.log(currentOptions);
};