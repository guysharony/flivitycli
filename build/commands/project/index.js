"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.action = exports.description = exports.options = exports.name = void 0;
exports.name = 'project';
exports.options = [
    {
        flags: '-t, --test <test profile>',
        description: 'define test profile'
    },
    {
        flags: '-tc, --test_config <path to file>',
        description: 'define configurations for a test mode'
    }
];
exports.description = 'Developing project mode.';
const action = (params) => {
    const currentOptions = params.opts();
    console.log(currentOptions);
};
exports.action = action;
