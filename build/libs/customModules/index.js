"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (key) => {
    let imported = null;
    try {
        imported = require(`./${key}`);
    }
    catch (e) {
        throw new Error(`unknown module '${key}'`);
    }
    return imported;
};
//# sourceMappingURL=index.js.map