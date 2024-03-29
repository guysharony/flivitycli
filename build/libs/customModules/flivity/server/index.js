"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const os_1 = require("os");
const localIP = (() => {
    const nets = (0, os_1.networkInterfaces)();
    const results = {};
    for (const name of Object.keys(nets)) {
        const current = nets[name];
        if (current) {
            for (const net of current) {
                if (net.family === 'IPv4' && !net.internal) {
                    if (!results[name])
                        results[name] = [];
                    results[name].push(net.address);
                }
            }
        }
    }
    return (results);
})();
class Server {
    constructor() {
        this._error = false;
        this._domain = '';
        this._mode = 'development';
    }
    get domain() {
        return this._domain;
    }
    get localIP() {
        try {
            return localIP.en1[0];
        }
        catch (e) {
            throw new Error(`You are not connected to the internet.`);
        }
    }
    get mode() {
        return this._mode;
    }
    get error() {
        return this._error;
    }
    set error(value) {
        this._error = value;
    }
    set mode(value) {
        this._mode = value;
    }
    set domain(value) {
        this._domain = value;
    }
}
exports.default = new Server();
//# sourceMappingURL=index.js.map