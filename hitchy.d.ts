/**
 * Provides all Hitchy-related information available in modules and functions of
 * a Hitchy-based application.
 */

import { IncomingMessage, ServerResponse } from "http";


export interface HitchyAPI extends HitchyLibraryAPI {
    /**
     * Exposes application's current runtime configuration.
     */
    config: HitchyConfig;

    /**
     * Exposes available components grouped by type of component.
     */
    runtime: HitchyRuntime;

    /**
     * Maps available plugins' roles into either plugin's API.
     */
    plugins: HitchyPlugins;

    /**
     * Exposes data storage available for globally saving volatile data during
     * application runtime exceeding lifetime of single requests.
     */
    data: object;
}

/**
 * Provides elements of Hitchy's API distributed as part of its core and thus
 * instantly available at start of bootstrap.
 */
export interface HitchyLibraryAPI {
    /**
     * Generates logger functions.
     *
     * @param facility name of logging facility
     */
    log: HitchyLoggerGenerator;

    router: HitchyRouterAPI;

    responder: HitchyResponderAPI;

    utility: HitchyUtilityAPI;

    /**
     * Conveniently simplifies loading module with optional support for common
     * module pattern.
     *
     * @param modulePath path name of module to load
     * @param moduleArguments arguments to pass in addition to module complying with common module pattern
     */
    loader: (modulePath: string, moduleArguments?: any[]) => (object | Function | Promise<object | Function>);

    cmp: (modulePath: string, customArgs?: any[]) => any;

    cmfp: (fn: HitchyCMP, customArgs?: any[]) => any;

    Client: HitchyRouterClient;
}

export type HitchyCMP = (this: HitchyAPI, options: HitchyOptions, ...customArgs: any[]) => any;

export interface HitchyRouterAPI {
    dispatch( context:HitchyRequestContext ): Promise<HitchyRequestContext>;

    client: HitchyRouterClient;
}

export interface HitchyResponderAPI {
    normalize( context:HitchyRequestContext ): HitchyRequestContext;
}

export interface HitchyUtilityAPI {
    object: {
        /**
         * Deeply seals provided data object.
         *
         * @param data object to be sealed deeply
         * @param testFn callback invoked with segments of current properties breadcrumb for deciding if property shall be frozen or not
         */
        seal(data: object, testFn?: (segments: string[]) => boolean): object,

        /**
         * Deeply freezes provided data object.
         *
         * @param data object to be frozen deeply
         * @param testFn callback invoked with segments of current properties breadcrumb for deciding if property shall be frozen or not
         */
        freeze(data: object, testFn?: (segments: string[]) => boolean): object,

        /**
         * Deeply merges provided source objects into given target object
         * returning the latter.
         *
         * @param target target object adjusted by merging
         * @param source single source object or list of source objects to be deeply merged into given target
         * @param strategyFn callback invoked to decide strategy for merging particular property
         */
        merge(target: object, source: (object|object[]), strategyFn: (breadcrumb:string[], strategy:HitchyMergeStrategy, sourceValue:any, targetValue:any) => HitchyMergeStrategy): object,
    },

    case: {
        /**
         * Converts naming style of provided string from kebab-case to camelCase.
         *
         * @param input string to be converted
         */
        kebabToCamel(input: string): string,

        /**
         * Converts naming style of provided string from kebab-case to PascalCase.
         *
         * @param input string to be converted
         */
        kebabToPascal(input: string): string,

        /**
         * Converts naming style of provided string from camelCase to kebab-case.
         *
         * @param input string to be converted
         */
        camelToKebab(input: string): string,

        /**
         * Converts naming style of provided string from PascalCase to kebab-case.
         *
         * @param input string to be converted
         */
        pascalToKebab(input: string): string,

        /**
         * Converts naming style of provided string from camelCase to PascalCase.
         *
         * @param input string to be converted
         */
        camelToPascal(input: string): string,
    },

    logger: HitchyLoggerGenerator,
}

/**
 * Selects a strategy of merging a particular property when deeply merging to
 * objects.
 */
export enum HitchyMergeStrategy {
    /**
     * Demands to skip merging current property.
     */
    KeepSource = "keep",

    /**
     * Demands to deeply merge value of source property into related target
     * property.
     */
    DeepMerge = "merge",

    /**
     * Demands to replace whole property of target with property provided by
     * source.
     */
    Replace = "replace",

    /**
     * Demands to create/extend list of values in target property with value(s)
     * found in source property.
     */
    Concat = "concat",
}

/**
 * Describes API of client for internally dispatching requests.
 */
export interface HitchyRouterClient {
    new(options: HitchyRouterClientOptions): HitchyRouterClient;

    dispatch: () => Promise<ServerResponse>;
    url: string;
    method: string;
    rawHeaders: string[];
    headers: { [key: string]: string };
    rawTrailers: string[];
    trailers: { [key: string]: string };
    socket: {
        address: object;
        localAddress: string;
        localPort: number;
        remoteAddress: string;
        remotePort: number;
        remoteFamily: string;
    };
    response: ServerResponse;
    httpVersion: string;
}

/**
 * Describes request to be dispatched internally.
 */
export interface HitchyRouterClientOptions {
    /**
     * Provides path name and query of request.
     */
    url: string;

    /**
     * Provides HTTP method of request.
     */
    method: string;

    /**
     * Lists custom request headers.
     */
    headers: { [key: string]: string };
}

/**
 * Represents options provided on starting Hitchy-based application e.g. via
 * CLI parameters.
 */
export interface HitchyOptions {
    /**
     * Selects folder containing application to be presented.
     */
    projectFolder: string;

    /**
     * Selects root folder of current instance of Hitchy framework.
     */
    hitchyFolder: string;

    /**
     * Selects separate folder containing node_modules/ subfolder w/ hitchy
     * extensions to be discovered. Omit to use same folder as `projectFolder`.
     */
    extensionsFolder?: string;

    /**
     * Set true to enable very noisy debugging by enabling any existing
     * logging facility.
     */
    debug?: boolean;

    /**
     * If true, Hitchy is handling errors rather than passing them back into
     * service it is injecting application into (e.g. Express).
     */
    handleErrors?: boolean;

    /**
     * lists folders of extensions to be loaded explicitly.
     */
    explicitExtensions?: String[];

    /**
     * Set true for loading explicitly provided extension folders, only.
     */
    explicitExtensionsOnly?: boolean;

    /**
     * Lists dependencies to enable for current project.
     *
     * This replaces list in project's hitchy.json file or the default behaviour
     * of enabling all available plugins.
     */
    dependencies: string[];
}

/**
 * Maps available plugins' roles into either plugin's API.
 */
export interface HitchyPlugins {
    [key: string]: HitchyPluginAPI;
}

/**
 * Maps available plugins' name into either plugin's handle.
 */
export interface HitchyPluginHandles {
    [key: string]: HitchyPluginHandle;
}

/**
 * Describes common elements of some plugin's API.
 */
export interface HitchyPluginAPI {
    /**
     * Exposes name of plugin.
     */
    $name: string;

    /**
     * Exposes role of plugin.
     */
    $role: string;

    /**
     * Exposes meta information on plugin.
     */
    $meta: object;

    /**
     * Exposes plugin's particular configuration loaded from Javascript files in
     * its **config** sub-folder.
     */
    $config: object;

    /**
     * Gets invoked when all plugins' APIs have been loaded.
     *
     * @param options options used on invoking application
     * @param plugins all available plugins' handles
     * @param handle current plugin's handle
     */
    onDiscovered?(this: HitchyAPI, options: HitchyOptions, plugins: HitchyPluginHandles, handle: HitchyPluginHandle): void;

    /**
     * Gets invoked after global configuration has been compiled from either
     * plugin's as well as application's particular configuration.
     *
     * @param options options used on invoking application
     * @param handle current plugin's handle
     */
    configure?(this: HitchyAPI, options: HitchyOptions, handle: HitchyPluginHandle): void;

    /**
     * Gets invoked before loading and exposing components of plugin.
     *
     * @param options options used on invoking application
     * @param handle current plugin's handle
     */
    onExposing?(this: HitchyAPI, options: HitchyOptions, handle: HitchyPluginHandle): void;

    /**
     * Gets invoked after having loaded and exposed components of plugin.
     *
     * @param options options used on invoking application
     * @param handle current plugin's handle
     */
    onExposed?(this: HitchyAPI, options: HitchyOptions, handle: HitchyPluginHandle): void;

    /**
     * Gets invoked after having exposed all components of every available
     * plugin as well as application itself.
     *
     * This callback is meant to initialise either plugin's resources if
     * required.
     *
     * @param options options used on invoking application
     * @param handle current plugin's handle
     */
    initialize?(this: HitchyAPI, options: HitchyOptions, handle: HitchyPluginHandle): void;

    /**
     * Gets invoked on gracefully shutting down Hitchy-based application.
     *
     * This callback is meant to release either plugin's resources if required.
     *
     * @param options options used on invoking application
     * @param handle current plugin's handle
     */
    shutdown?(this: HitchyAPI, options: HitchyOptions, handle: HitchyPluginHandle): void;
}

/**
 * Describes single plugin during bootstrap of Hitchy-based application.
 */
export interface HitchyPluginHandle {
    /**
     * Provides name of plugin.
     */
    name: string;

    /**
     * Caches role claimed by plugin in its **hitchy.json** file.
     */
    staticRole: string;

    /**
     * Provides folder containing plugin.
     */
    folder: string;

    /**
     * Provides particular configuration of plugin loaded from Javascript files
     * found in its **config** sub-folder.
     */
    config: object;

    /**
     * Exposes meta information on plugin read from its **hitchy.json** file as
     * well as probably extended by its API.
     */
    meta: object;

    /**
     * Provides API exported by plugin.
     */
    api: HitchyPluginAPI;
}

export type HitchyLoggerGenerator = (facility: string) => HitchyLoggerFunction;

/**
 * Logs provided message on behalf of a particular logging facility.
 */
export type HitchyLoggerFunction = (message: string) => void;

/**
 * Represents essential subset of either Hitchy-based application's
 * configuration.
 */
export interface HitchyConfig {
    /**
     * Exposes part of global configuration that originate's from current
     * application's configuration files, only.
     */
    $appConfig: HitchyConfig;

    /**
     * Exposes routing declarations for (terminal) routes.
     */
    routes: HitchyRoutingConfig;

    /**
     * Exposes routing declarations for policies.
     */
    policies: HitchyRoutingConfig;

    /**
     * Exposes routing declarations for blueprints.
     */
    blueprints: HitchyRoutingConfig;

    /**
     * Exposes configuration affecting behaviour of Hitchy's core.
     */
    hitchy: HitchyCoreConfig;
}

/**
 * Describes part of configuration affecting behaviour of Hitchy's core.
 */
export interface HitchyCoreConfig {
    /**
     * Controls whether names of folders containing components per type of
     * component are reversed and appended to either resulting component's name
     * or not.
     *
     * This parameter defaults to `true` and must be set `false` explicitly to
     * have folders' names prepended without reversing order.
     *
     * @note This parameter works per plugin or related to the application, only.
     */
    appendFolders?: boolean;

    /**
     * Controls whether Hitchy is searching for component modules in sub-folders
     * per type of components.
     *
     * This parameter defaults to `true` and must be set `false` explicitly to
     * ignore and sub-folders per type of component.
     *
     * @note This parameter works per plugin or related to the application, only.
     */
    deepComponents?: boolean;
}

export type HitchyRoutingConfig =
    HitchyRoutingDeclaration
    | HitchyRoutingSlotDeclaration;

/**
 * Describes routing declarations grouped by routing slot for explicit
 * separation.
 */
export interface HitchyRoutingSlotDeclaration {
    early?: HitchyRoutingDeclaration;
    before?: HitchyRoutingDeclaration;
    after?: HitchyRoutingDeclaration;
    late?: HitchyRoutingDeclaration;
}

/**
 * Lists routing sources mapped into routing targets.
 */
export interface HitchyRoutingDeclaration {
    [key: string]: HitchyRoutingTargetDeclaration;
}

export type HitchyRoutingTargetDeclaration =
    HitchyRoutingTargetFunction
    | HitchyRoutingTargetName
    | HitchyRoutingTargetDescriptor;
export type HitchyRoutingTargetFunction =
    HitchyRequestControllerHandler
    | HitchyRequestPolicyHandler;
export type HitchyRoutingTargetName = String;

export interface HitchyRoutingTargetDescriptor {
    module: HitchyControllerComponent | HitchyPolicyComponent;
    method: HitchyRequestControllerHandler | HitchyRequestPolicyHandler;
    args?: any[];
}

/**
 * Defines signature of a controller's request handler.
 */
export type HitchyRequestControllerHandler = (this: HitchyRequestContext, req: HitchyIncomingMessage, res: HitchyServerResponse, ...customParameters: any[]) => Promise<any>;

/**
 * Defines signature of a policy's request handler.
 */
export type HitchyRequestPolicyHandler = (this: HitchyRequestContext, req: HitchyIncomingMessage, res: HitchyServerResponse, next: (error?: Error) => void, ...customParameters: any[]) => Promise<any>;

/**
 * Defines collections of components grouped by type of component.
 */
export interface HitchyRuntime {
    controllers: HitchyControllerComponents;
    controller: HitchyControllerComponents;
    policies: HitchyPolicyComponents;
    policy: HitchyPolicyComponents;
    models: HitchyModelComponents;
    model: HitchyModelComponents;
    services: HitchyServiceComponents;
    service: HitchyServiceComponents;
}

export interface HitchyControllerComponents {
    [key: string]: HitchyControllerComponent;
}

export interface HitchyPolicyComponents {
    [key: string]: HitchyPolicyComponent;
}

export interface HitchyModelComponents {
    [key: string]: HitchyModelComponent;
}

export interface HitchyServiceComponents {
    [key: string]: HitchyServiceComponent;
}

export interface HitchyComponent {
}

export type HitchyControllerComponent = HitchyComponent;
export type HitchyPolicyComponent = HitchyComponent;
export type HitchyModelComponent = HitchyComponent;
export type HitchyServiceComponent = HitchyComponent;

/**
 * Extends IncomingMessage of Node.js in context of a Hitchy-based application.
 */
export interface HitchyIncomingMessage extends IncomingMessage {
    hitchy: HitchyAPI;
    accept: string[];
    cookies?: { [key: string]: string };
    params: { [key: string]: string | string[] };
    path: string;
    query: { [key: string]: string | string[] }
    session?: { [key: string]: any }

    fetchBody(parser?: boolean | HitchyBodyParser);
}

/**
 * Extends ServerResponse of Node.js in context of a Hitchy-based application.
 */
export interface HitchyServerResponse extends ServerResponse {
    /**
     * Sends response data ending response afterwards.
     *
     * @param content response body
     * @param encoding optional encoding of response body used when providing content as string
     */
    send(content: (string | Buffer), encoding?: string): HitchyServerResponse;

    /**
     * Adjusts HTTP response status code.
     *
     * @param statusCode HTTP status code, e.g. 200 for OK
     */
    status(statusCode: number): HitchyServerResponse;

    /**
     * Adjusts response header indicating type of content in response body.
     *
     * @param typeName string selecting type of content, should be MIME identifier, but may be some short alias as well
     */
    type(typeName: string): HitchyServerResponse;

    /**
     * Picks one of the provided callbacks according to request's Accept header
     * for generating the actual response.
     *
     * @param handlers set of handlers, each generating response in a different format
     */
    format(handlers: { [key: string]: HitchyRequestControllerHandler }): HitchyServerResponse;

    /**
     * Generates JSON-formatted response from provided set of data.
     *
     * @param data data to be sent in response
     */
    json(data: object): HitchyServerResponse;

    /**
     * Adjusts response header.
     *
     * @param headersOrName name of header to adjust or object containing multiple header fields to adjust
     * @param value value of single named header field to adjust
     */
    set(headersOrName: ({ [key: string]: string } | string), value: string): HitchyServerResponse;

    /**
     * Adjusts response headers to demand redirection.
     *
     * @param statusCode redirection status code to use, omit to use default 301
     * @param url redirection URL client is asked to fetch instead
     */
    redirect(statusCode: number, url: string): HitchyServerResponse;
}

/**
 * Implements parser for request body.
 */
export type HitchyBodyParser = (raw: Buffer) => (any | Promise<any>);

/**
 * Describes context via `this` in request handlers of a Hitchy-based
 * application.
 */
export interface HitchyRequestContext {
    request: HitchyIncomingMessage;
    response: HitchyServerResponse;

    /**
     * Some request-bound data storage suitable for sharing data between
     * handlers of same request.
     */
    local: { [key: string]: any };

    api: HitchyAPI;
    config: HitchyConfig;
    runtime: HitchyRuntime;
    controllers: HitchyControllerComponents;
    controller: HitchyControllerComponents;
    policies: HitchyPolicyComponents;
    policy: HitchyPolicyComponents;
    models: HitchyModelComponents;
    model: HitchyModelComponents;
    services: HitchyServiceComponents;
    service: HitchyServiceComponents;
    startTime: number;
    context: HitchyContextIdentifier;
    done( error?: Error ): void;
    /** @private */
    consumed: boolean;
}

export enum HitchyContextIdentifier {
    Standalone= "standalone",
    Express= "express",
}
