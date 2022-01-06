"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.action = exports.description = exports.options = exports.params = exports.name = void 0;
exports.name = 'auth';
exports.params = '[options]';
exports.options = [
    {
        flags: '-l, --login <login>',
        description: 'Amazon user login.',
        type: 'string',
        required: true
    },
    {
        flags: '-p, --password <password>',
        description: 'Amazon user password.'
    }
];
exports.description = 'Authenticating to Amazon account.';
const action = (params) => {
    const currentOptions = params.opts();
    console.log(currentOptions);
};
exports.action = action;
