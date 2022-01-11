"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectMerge = void 0;
const ObjectMerge = (target, source) => {
    const isObject = (value) => {
        return value && value instanceof Object && !(value instanceof Array);
    };
    return JSON.parse(JSON.stringify(Object.assign(Object.assign({}, target), source)), (key, value) => {
        if (isObject(target[key]) && isObject(value))
            return (0, exports.ObjectMerge)(target[key], value);
        return value;
    });
};
exports.ObjectMerge = ObjectMerge;
//# sourceMappingURL=index.js.map