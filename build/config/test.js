"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.find = void 0;
let configs = [
    {
        name: 'dev',
        properties: {
            host: 'https://localhost'
        }
    },
    {
        name: 'prod',
        properties: {
            host: 'https://flivity.com'
        }
    }
];
const find = (name) => {
    const config = configs.filter(config => config.name == name);
    if (!config.length)
        return (null);
    return (config[0]);
};
exports.find = find;
//# sourceMappingURL=test.js.map