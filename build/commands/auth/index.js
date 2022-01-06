"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.action = exports.description = exports.options = exports.name = void 0;
exports.name = 'auth';
exports.options = [
    {
        flags: '-l, --login <string>',
        description: 'aws user login',
        required: true
    },
    {
        flags: '-p, --password <string>',
        description: 'aws user password'
    }
];
exports.description = 'Authenticating to aws account.';
const action = (params) => {
    const currentOptions = params.opts();
};
exports.action = action;
//# sourceMappingURL=index.js.map