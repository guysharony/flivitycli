"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../../types");
class Database {
    constructor() {
        this.databases = [];
    }
    create(properties) {
        const master_name = properties.name instanceof Function ? properties.name() : properties.name;
        const master_length = this.find(master_name);
        const master_key = `${master_name}${master_length ? `_${master_length}` : ''}`;
        this.databases.push(Object.assign(Object.assign({}, properties), { key: master_key }));
        return {
            replicate: (replicate) => {
                const replica_base = `${master_key}_replica`;
                const replicas_length = this.databases.filter(database => database.key.startsWith(replica_base));
                const replicas_key = `${replica_base}${replicas_length ? `_${replicas_length}` : ''}`;
                return Object.assign(Object.assign({}, (0, types_1.ObjectMerge)(replicate, replicate)), { key: replicas_key });
            }
        };
    }
    find(key) {
        const availables = this.databases.filter(database => (typeof key == 'string' ? [key] : key).includes(database.key));
        if (!availables.length)
            return (null);
        return availables.reduce((obj, item) => (obj[item.key] = ((_a) => {
            var { key } = _a, o = __rest(_a, ["key"]);
            return o;
        })(item), obj), {});
    }
}
exports.default = new Database();
//# sourceMappingURL=index.js.map