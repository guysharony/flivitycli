"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
;
;
;
exports.default = ((__clusters) => {
    return {
        create: (properties) => {
            if (__clusters.filter(cluster => cluster.name == properties.name).length)
                throw new Error(`Cluster '${properties.name}' already exist.`);
            __clusters.push(properties);
        },
        find: (name) => {
            const availables = __clusters.filter(cluster => cluster.name == name);
            return availables.length ? availables[0] : null;
        }
    };
})([]);
//# sourceMappingURL=index.js.map