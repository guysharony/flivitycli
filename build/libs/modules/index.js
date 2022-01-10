"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
exports.default = (key) => {
    console.log(key);
    /*

    const imported = importCommand(key);

    if (!imported)
        throw new Error(`unknown module '${key}'.`);

    return imported;

    */
};
//# sourceMappingURL=index.js.map