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
class AmazonCreate {
    constructor(parent) {
        this.parent = parent;
    }
    create(properties, type) {
        const counter = this.parent.services.filter(service => service.name == properties.name && service.type == type);
        const baseKey = `aws_${type.toLowerCase()}`;
        const baseName = properties.name && properties.name.length > 0 ? `_${properties.name}` : '';
        const baseRank = counter.length ? `_${counter.length}` : '';
        const key = `${baseKey}${baseName}${baseRank}`;
        this.parent.services.push(Object.assign(Object.assign({}, properties), { type,
            key }));
        return key;
    }
    s3(properties) {
        return this.create(properties, 'S3');
    }
    ses(properties) {
        return this.create(properties, 'SES');
    }
    mediaConvert(properties) {
        return this.create(properties, 'MEDIA_CONVERT');
    }
}
class Amazon {
    constructor() {
        this.services = [];
    }
    get zone() {
        return {
            city: 'paris',
            region: 'eu-west-3'
        };
    }
    find(key) {
        const availables = this.services.filter(service => (typeof key == 'string' ? [key] : key).includes(service.key instanceof Function ? service.key() : service.key));
        if (!availables.length)
            return (null);
        return availables.reduce((obj, item) => (obj[item.key instanceof Function ? item.key() : item.key] = ((_a) => {
            var { key } = _a, o = __rest(_a, ["key"]);
            return o;
        })(item), obj), {});
    }
    get create() {
        return new AmazonCreate(this);
    }
}
exports.default = new Amazon();
//# sourceMappingURL=index.js.map