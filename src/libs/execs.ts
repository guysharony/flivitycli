import colors, { Color } from 'colors';
import child_process from 'child_process';
import * as flivity from './customModules/flivity';

colors.enable();

interface Timer {
	delay?: number;
	retry?: {
		interval?: number;
		max?: number;
	};
};

type DisplayColor = 'black' | 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan' | 'white';


export const sleep = (ms: number) => {
	return new Promise(resolve => setTimeout(resolve, ms));
}

export const timer = async <T>(params: Timer = {}): Promise<{ call(callback: () => T): Promise<Awaited<T>>; }> => {
	let retries = 0;

	const timerBase = async (callback: () => T): Promise<Awaited<T>> => {
		if (params.retry?.interval) sleep(params.retry.interval);

		let data = null;
		let error: string | null = null;

		try {
			data = await callback();
		} catch (e) {
			error = e instanceof Error ? e.message : <string>e;
			data = null;
		}

		if (data) return data;

		if (params.retry?.max && retries + 1 >= params.retry.max) {
			throw new Error(`[${retries}]: ${error || 'Failed to create instance.'}`);
		}

		retries++;

		return await timerBase(callback);
	}

	return {
		async call(callback: () => T): Promise<Awaited<T>> {
			if (params.delay) await sleep(params.delay);

			return await timerBase(callback);
		}
	};
}

export function display(value: string): void;
export function display(value: string, region?: boolean): void;
export function display(arg1: any, arg2?: any): void {
	const region = arg2 && typeof(arg2) == 'boolean';

	const zone = flivity.amazon.zone;
	const output = `${region ? `[${zone.region}] ` : ''}${arg1}`;

	if (zone.color && region) return console.log(output[zone.color]);

	return console.log(output);
}

export const execute = (command: string) => {
	return child_process.execSync(command, { encoding: 'utf8', stdio: 'pipe' });
}