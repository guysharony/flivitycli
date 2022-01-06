import { Command } from 'commander';


export const program = new Command();

export interface Option {
    flags: string;
    description: string;
    defaultValue?: undefined;
	required?: boolean;
	type: 'string' | 'number' | 'boolean'
}

export type Options = Option[];

export interface CommandDefinition {
	name: string;
	params: string;
	options: Options;
	description: string;
	action: (arg: Command) => Promise<void>;
};

export interface CommandError {
	code: string;
	exitCode: number;
	[x: string]: any;
}