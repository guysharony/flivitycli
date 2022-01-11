"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Secrets {
    constructor() {
        this.secrets = [];
    }
    create(properties) {
        const name = properties.name instanceof Function ? properties.name() : properties.name;
        if (this.find(name))
            throw new Error(`Secret '${name}' already exist.`);
        this.secrets.push(properties);
        return name;
    }
    find(name) {
        const items = this.secrets.filter(secret => (secret.name instanceof Function ? secret.name() : secret.name) == name);
        return items.length ? items[0] : null;
    }
}
exports.default = new Secrets();
//# sourceMappingURL=index.js.map