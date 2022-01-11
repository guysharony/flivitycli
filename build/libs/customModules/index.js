"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (key) => {
    let imported = null;
    try {
        imported = require(`./${key}`);
    }
    catch (e) {
        console.log(e);
        return;
    }
    return imported;
};
//# sourceMappingURL=index.js.map