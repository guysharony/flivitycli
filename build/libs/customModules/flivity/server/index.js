"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ((__server) => {
    return {
        set domain(value) {
            __server.domain = value;
        },
        get domain() {
            return __server.domain;
        },
        set mode(value) {
            __server.domain = value;
        },
        get mode() {
            return __server.mode;
        }
    };
})({
    domain: 'https://localhost',
    mode: 'development'
});
//# sourceMappingURL=index.js.map