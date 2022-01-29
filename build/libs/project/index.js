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
const yaml_1 = __importDefault(require("yaml"));
const path_1 = __importDefault(require("path"));
const serialize_javascript_1 = __importDefault(require("serialize-javascript"));
const files = __importStar(require("../files"));
const loadConfig = (dir) => {
    try {
        return require(path_1.default.join(dir, '.flv', 'index.js'));
    }
    catch (e) {
        if (e instanceof Error) {
            console.log(`flivitycli: ${e.message}`);
        }
    }
};
const load = async (dir) => {
    let _servers = null;
    let _outputSubdir = null;
    let _watchFiles = false;
    const compiled = loadConfig(dir)();
    if (!compiled)
        return (null);
    compiled.input = {
        absolute: path_1.default.join(dir, compiled.input),
        relative: compiled.input
    };
    compiled.output = {
        source: path_1.default.join(dir, compiled.output),
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
        set servers(value) {
            _servers = value;
        },
        set outputSubdir(value) {
            _outputSubdir = value;
        },
        set watchFiles(value) {
            _watchFiles = value;
        },
        apply: async (vars = {}) => {
            if (_outputSubdir) {
                compiled.output.absolute = path_1.default.join(compiled.output.absolute, _outputSubdir);
                compiled.output.relative = path_1.default.join(compiled.output.relative, _outputSubdir);
            }
            let variables = parseVariables(vars);
            fs_1.default.rmSync(compiled.output.absolute, { recursive: true, force: true });
            for (const server of compiled.servers) {
                const server_name = server.name;
                const allowed_server = !_servers || _servers.includes(server_name);
                if (!allowed_server)
                    delete compiled.servers[server_name];
                else {
                    const server_source = 'source' in server ? server.source : server_name;
                    const compose_file = path_1.default.join(compiled.output.absolute, server_name, server.file);
                    const secrets_dir = {
                        relative: path_1.default.join(server.secrets),
                        absolute: path_1.default.join(compiled.output.absolute, server_name, server.secrets)
                    };
                    const imported_compose = server.compose;
                    for (const service_name in imported_compose.services) {
                        const service = imported_compose.services[service_name];
                        const service_secrets = service.secrets;
                        let service_environment = Object.assign({}, variables);
                        if (service.environment) {
                            service_environment = Object.assign(Object.assign({}, service_environment), parseVariables({
                                flivity: {
                                    env: service.environment
                                }
                            }));
                        }
                        if ('build' in service) {
                            const inputContext = path_1.default.join(compiled.input.absolute, server_source, service.build.context);
                            const outputContext = path_1.default.join(compiled.output.absolute, server_name, service.build.context);
                            await files.replaceVars(inputContext, outputContext, {
                                vars: service_environment,
                                watch: _watchFiles
                            });
                        }
                        if (service.environment) {
                            const env_file_relative = path_1.default.join('build' in service ? service.build.context : `./services/${service.container_name}/`, 'env');
                            const env_file_absolute = path_1.default.join(compiled.output.absolute, server_name, env_file_relative);
                            const env_data = (await Promise.all(Object.entries(service.environment).map(async ([k, v]) => {
                                const env_value_func = async () => { return await v; };
                                return `${k}=${(await env_value_func())}`;
                            }))).join('\n');
                            fs_1.default.mkdirSync(path_1.default.dirname(env_file_absolute), { recursive: true });
                            fs_1.default.openSync(env_file_absolute, 'w');
                            fs_1.default.writeFileSync(env_file_absolute, env_data);
                            delete service.environment;
                            service.env_file = [env_file_relative];
                        }
                        const service_secrets_absolute = secrets_dir.absolute.replace(new RegExp('%__service__%', 'g'), service_name);
                        const service_secrets_relative = secrets_dir.relative.replace(new RegExp('%__service__%', 'g'), service_name);
                        let secrets = [];
                        for (const secret_name in service_secrets) {
                            const compose_secret_name = `${service_name}__${secret_name}`.toLowerCase();
                            const secret_absolute = path_1.default.join(service_secrets_absolute, secret_name);
                            const secret_relative = path_1.default.join(service_secrets_relative, secret_name);
                            const createSecret = async () => new Promise((resolve, rejects) => {
                                fs_1.default.mkdir(path_1.default.dirname(secret_absolute), { recursive: true }, async function (err) {
                                    if (err)
                                        return rejects(null);
                                    const secret_value_func = async () => { return await service_secrets[secret_name]; };
                                    const secret_value = await secret_value_func();
                                    fs_1.default.writeFileSync(secret_absolute, (!['string', 'number'].includes(typeof secret_value)) ? (0, serialize_javascript_1.default)(secret_value) : `${secret_value}`);
                                    if (!('secrets' in imported_compose))
                                        server.compose['secrets'] = {};
                                    imported_compose.secrets[compose_secret_name] = { file: secret_relative };
                                    secrets.push(compose_secret_name);
                                    return resolve(compose_secret_name);
                                });
                            });
                            await createSecret();
                        }
                        if (secrets.length) {
                            imported_compose.services[service_name].secrets = secrets;
                        }
                    }
                    fs_1.default.mkdir(path_1.default.dirname(compose_file), { recursive: true }, function (err) {
                        if (err)
                            return null;
                        fs_1.default.writeFileSync(compose_file, yaml_1.default.stringify(imported_compose));
                    });
                }
            }
            return compiled;
        }
    };
    return properties;
};
exports.load = load;
//# sourceMappingURL=index.js.map