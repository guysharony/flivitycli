"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const flivity = __importStar(require("../customModules/flivity"));
const files = __importStar(require("../files"));
const loadConfig = (dir) => {
    let data = null;
    try {
        data = require(path_1.default.join(dir, '.flv', 'index.js'));
    }
    catch (e) {
        return (null);
    }
    return (data);
};
const load = (dir) => {
    const compiled = loadConfig(dir);
    compiled.input = {
        absolute: path_1.default.join(dir, compiled.input),
        relative: compiled.input
    };
    compiled.output = {
        absolute: path_1.default.join(dir, compiled.output),
        relative: compiled.output
    };
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
            /*
            fs.mkdir(path.dirname(destination), { recursive: true }, function (err) {
                if (err) return null;

                fs.writeFileSync(destination, data);
            });
            */
        },
        apply: async (vars = {}) => {
            console.log('VARIABLE: ', flivity);
            // const variables = parseVariables(vars);
            for (const server_name in compiled.servers) {
                const server = compiled.servers[server_name];
                const compose_file = path_1.default.join(compiled.output.absolute, server_name, server.file);
                const secrets_dir = {
                    relative: path_1.default.join(server.secrets),
                    absolute: path_1.default.join(compiled.output.absolute, server_name, server.secrets)
                };
                const imported = compiled.servers[server_name];
                for (const service_name in imported.compose.services) {
                    const service = imported.compose.services[service_name];
                    const service_secrets = service.secrets;
                    if ('build' in service) {
                        const inputContext = path_1.default.join(compiled.input.absolute, server_name, service.build.context);
                        const outputContext = path_1.default.join(compiled.output.absolute, server_name, service.build.context);
                        await files.replaceVars(inputContext, outputContext, vars);
                    }
                    const service_secrets_absolute = secrets_dir.absolute.replace(new RegExp('%__service__%', 'g'), service_name);
                    const service_secrets_relative = secrets_dir.relative.replace(new RegExp('%__service__%', 'g'), service_name);
                    let secrets = [];
                    for (const secret_name in service_secrets) {
                        const compose_secret_name = `${service_name}__${secret_name}`.toLowerCase();
                        const secret_absolute = path_1.default.join(service_secrets_absolute, secret_name);
                        const secret_relative = path_1.default.join(service_secrets_relative, secret_name);
                        const createSecret = async () => new Promise((resolve, rejects) => {
                            fs_1.default.mkdir(path_1.default.dirname(secret_absolute), { recursive: true }, function (err) {
                                if (err)
                                    return rejects(null);
                                const secret_value = service_secrets[secret_name];
                                fs_1.default.writeFileSync(secret_absolute, (!['string', 'number'].includes(typeof secret_value)) ? (0, serialize_javascript_1.default)(secret_value) : `${service_secrets[secret_name]}`);
                                if (!('secrets' in imported.compose))
                                    compiled.servers[server_name].compose['secrets'] = {};
                                compiled.servers[server_name].compose.secrets[compose_secret_name] = { file: secret_relative };
                                secrets.push(compose_secret_name);
                                return resolve(compose_secret_name);
                            });
                        });
                        await createSecret();
                    }
                    if (secrets.length) {
                        compiled.servers[server_name].compose.services[service_name].secrets = secrets;
                    }
                }
                fs_1.default.mkdir(path_1.default.dirname(compose_file), { recursive: true }, function (err) {
                    if (err)
                        return null;
                    fs_1.default.writeFileSync(compose_file, yaml_1.default.stringify(compiled.servers[server_name].compose));
                });
                /*
                const imported = compiled.servers[server];

                const file = path.join(compiled.output, imported.file);
                const secrets = path.join(compiled.output, imported.secrets);

                console.log(file, imported.file);
                console.log(secrets, imported.secrets);

                for (const service in imported.compose.services) {
                    const secretsDir = imported.secrets.replace(new RegExp('%__service__%', 'g'), service);

                    const secrets = imported.compose.services[service].secrets;

                    for (const secret in secrets) {
                        const secretsRel = secretsDir;
                        const secretsAbs = path.join(outputAbsDir, secretsDir);

                        console.log(path.join(secretsRel, secret), ' ==> ', path.join(secretsAbs, secret));
                        // console.log(`${path.join(compiled.output, secretsDir)} == ${secret} => ${secrets[secret]}`);
                    }
                }
                */
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