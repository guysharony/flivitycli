"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = exports.usage = exports.name = exports.create = void 0;
const commands_1 = require("../libs/commands");
const importCommand = (key) => {
    let command = null;
    try {
        command = require(`./${key}`);
    }
    catch (e) {
        return (command);
    }
    return (command);
};
const create = async (key) => {
    const command = importCommand(key);
    if (!command) {
        console.log(`flivitycli: '${key}' is not a flivitycli command.`);
        console.log(`See 'flivitycli --help'`);
        return;
    }
    const { name, params, options = [], description, action } = command;
    const current = commands_1.program.command(`${name}${params ? ` ${params}` : ''}`);
    options.map(({ flags, description, defaultValue = null, required = false }) => {
        if (!defaultValue) {
            if (required)
                return current.requiredOption(flags, description);
            return current.option(flags, description);
        }
        if (required) {
            throw new Error("A required option can't have a default value.");
        }
        return current.option(flags, description, defaultValue);
    });
    current.description(description);
    current.action(() => {
        const currentOptions = commands_1.program.opts();
        console.log(current, currentOptions);
        action(current);
    });
};
exports.create = create;
const name = (params) => {
    commands_1.program.name(params);
};
exports.name = name;
const usage = (params) => {
    commands_1.program.usage(params);
};
exports.usage = usage;
const execute = (callback) => {
    commands_1.program.configureOutput({
        writeOut: (str) => process.stdout.write(`[OUT] ${str}`),
        writeErr: (str) => process.stdout.write(`[ERR] ${str}`),
        outputError: (str) => {
            if (commands_1.program.args.length) {
                console.log(str.replace("error: ", "flivitycli: "));
                console.log(`See 'flivitycli --help'`);
            }
        }
    });
    commands_1.program.parse(process.argv);
};
exports.execute = execute;
