"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
;
;
;
class Clusters {
    constructor() {
        this.clusters = [];
    }
    find(name) {
        const items = this.clusters.filter(cluster => (cluster.name instanceof Function ? cluster.name() : cluster.name) == name);
        return items.length ? items[0] : null;
    }
    create(properties) {
        if (this.find(properties.name instanceof Function ? properties.name() : properties.name))
            throw new Error(`Cluster '${properties.name}' already exist.`);
        this.clusters.push(properties);
    }
}
exports.default = new Clusters();
//# sourceMappingURL=index.js.map