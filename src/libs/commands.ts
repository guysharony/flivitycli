import { Command } from 'commander';


export const program = new Command();

export interface CommandOption {
    flags: string;
    description: string;
    defaultValue?: string;
	required?: boolean;
	type?: 'string' | 'number' | 'boolean'
}

export type CommandOptions = CommandOption[];

export interface CommandDefinition {
	name: string;
	params: string;
	options?: CommandOptions;
	description: string;
	action: (arg: Command) => Promise<void>;
};

export interface CommandError {
	code: string;
	exitCode: number;
	[x: string]: any;
}