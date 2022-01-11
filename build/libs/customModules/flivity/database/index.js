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
        const newdatabase = ((_a) => {
            var { replicate } = _a, standby = __rest(_a, ["replicate"]);
            if (!replicate)
                return Object.assign(Object.assign({}, standby), { key: `${standby.name}` });
            const replicaBase = `${replicate.key}_replica`;
            const replicas = this.databases.filter(database => database.key.startsWith(replicaBase));
            return Object.assign(Object.assign({}, (0, types_1.ObjectMerge)(replicate, standby)), { key: `${replicaBase}_${replicas.length}` });
        })(properties);
        if (this.find(newdatabase.key))
            throw new Error(`Database '${newdatabase.key}' already exist.`);
        this.databases.push(newdatabase);
        return newdatabase;
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