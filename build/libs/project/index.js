"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.load = void 0;
const fs_1 = __importDefault(require("fs"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const yaml_1 = __importDefault(require("yaml"));
const path_1 = __importDefault(require("path"));
const serialize_javascript_1 = __importDefault(require("serialize-javascript"));
const loadConfig = (dir) => {
    let data = null;
    try {
        data = require(path_1.default.join(dir, '.flv', 'index.js'));
        data.input = path_1.default.join(dir, data.input);
        data.output = path_1.default.join(dir, data.output);
    }
    catch (e) {
        return (null);
    }
    return (data);
};
const load = (dir) => {
    const compiled = loadConfig(dir);
    const parseVariables = (vars = {}) => {
        const __base = (imported, prefix = null) => {
            let exported = {};
            for (const imported_iterator in imported) {
                const exported_key = `${prefix ? `${prefix}.` : ''}${imported_iterator}`.toUpperCase();
                if (imported[imported_iterator] instanceof Object) {
                    exported = Object.assign(Object.assign({}, exported), __base(imported[imported_iterator], exported_key));
                }
                else {
                    exported[exported_key] = imported[imported_iterator];
                }
            }
            return exported;
        };
        return __base(vars);
    };
    const properties = {
        replaceVariables: async (source, destination, vars) => {
            let data = fs_extra_1.default.readFileSync(source, 'utf-8');
            await Promise.all(Object.entries(vars).map(async ([key, value]) => {
                value = (!['string', 'number'].includes(typeof value)) ? (0, serialize_javascript_1.default)(value) : value;
                data = data.replace(new RegExp(`%__${key.toUpperCase()}__%`, 'g'), value);
            }));
            fs_1.default.mkdir(path_1.default.dirname(`${destination}.json`), { recursive: true }, function (err) {
                if (err)
                    return null;
                fs_1.default.writeFileSync(`${destination}.json`, JSON.stringify(yaml_1.default.parse(data), null, '\t').replace(/: "(?:[^"]+|\\")*",?$/gm, ' $&'));
            });
            /*
            fs.mkdir(path.dirname(destination), { recursive: true }, function (err) {
                if (err) return null;

                fs.writeFileSync(destination, data);
            });
            */
        },
        apply: async (vars = {}) => {
            const variables = parseVariables(vars);
            for (const server in compiled.servers) {
                const imported = compiled.servers[server];
                if (imported.file)
                    imported.file = path_1.default.join(compiled.output, imported.file);
                if (imported.secrets)
                    imported.secrets = path_1.default.join(compiled.output, imported.secrets);
                console.log(imported);
            }
            /*
            for (const compose in compiled.composes) {
                const service = compiled.composes[compose];

                await properties.replaceVariables(
                    path.join(compiled.input, service.entry),
                    path.join(compiled.output, service.entry),
                    variables
                );
            }
            */
        }
    };
    return properties;
};
exports.load = load;
//# sourceMappingURL=index.js.map