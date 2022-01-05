export const name = 'auth';

export const params = '[options]';

export const options = [
	{
		flags: '-l, --login',
		description: 'Amazon user login.',
		defaultValue: 'LOOOL'
	},
	{
		flags: '-p, --password',
		description: 'Amazon user password.'
	}
];

export const description = 'Authenticating to Amazon account.';

export const action = (params) => {
	console.log('Everything is ok: ', params);
};