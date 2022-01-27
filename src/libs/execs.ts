import colors from 'colors';
import child_process from 'child_process';
import * as flivity from './customModules/flivity';

colors.enable();

export const display = (value: string, region: boolean = true) => {
	const zone = flivity.amazon.zone;
	const output = `${region ? `[${zone.region}] ` : ''}${value}`;

	return console.log(output[zone.color && region ? zone.color : 'white']);
}

export const execute = (command: string) => {
	return child_process.execSync(command, { encoding: 'utf8', stdio: 'pipe' });
}