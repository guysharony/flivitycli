import colors from 'colors';
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

export const sleep = (ms: number) => {
	return new Promise(resolve => setTimeout(resolve, ms));
}

export const timer = async <T>(params: Timer = {}): Promise<{ call(callback: () => T): Promise<Awaited<T>>; }> => {
	let retries = 0;

	const timerBase = async (callback: () => T): Promise<Awaited<T>> => {
		if (params.retry?.interval) sleep(params.retry.interval);

		const result = await callback();

		if (result) return result;

		if (params.retry?.max && retries + 1 >= params.retry?.max)
			throw new Error(`Failed to execute function.`);

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

export const display = (value: string, region: boolean = true) => {
	const zone = flivity.amazon.zone;
	const output = `${region ? `[${zone.region}] ` : ''}${value}`;

	return console.log(output[zone.color && region ? zone.color : 'white']);
}

export const execute = (command: string) => {
	return child_process.execSync(command, { encoding: 'utf8', stdio: 'pipe' });
}