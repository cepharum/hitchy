/**
 * Provides all Hitchy-related information available in modules and functions of
 * a Hitchy-based application.
 */
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
    log( facility: string ): LoggerFunction;

    bootstrap: HitchyBootstrapAPI;

    router: HitchyRouterAPI;

    responder: HitchyResponderAPI;

    utility: HitchyUtilityAPI;

    /**
     * Conveniently simplifies loading module with optional support for common
     * module pattern.
     *
     * @param modulePath path name of module to load
     * @param moduelArguments arguments to pass in addition to module complying with common module pattern
     */
    loader: ( modulePath: string, moduelArguments?: any[] ) => ( object | Function | Promise<object|Function> );

    cmp: ( modulePath: string, customArgs?: any[] ) => any;

    cmfp: ( fn: HitchyCMP, customArgs?: any[] ) => any;

    Client: HitchyRouterClient;
}

export type HitchyCMP = ( this: HitchyAPI, options: HitchyOptions, ...customArgs: any[] ) => any;

export interface HitchyBootstrapAPI {

}

export interface HitchyRouterAPI {

}

export interface HitchyResponderAPI {

}

export interface HitchyUtilityAPI {

}

/**
 * Describes API of client for internally dispatching requests.
 */
export interface HitchyRouterClient {
    constructor( options: HitchyRouterClientOptions );
    dispatch: () => Promise<NodeJsServerResponse>;
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
    response: NodeJsServerResponse;
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
    onDiscovered?( this:HitchyAPI, options:HitchyOptions, plugins:HitchyPluginHandles, handle:HitchyPluginHandle ): void;

    /**
     * Gets invoked after global configuration has been compiled from either
     * plugin's as well as application's particular configuration.
     *
     * @param options options used on invoking application
     * @param handle current plugin's handle
     */
    configure?( this:HitchyAPI, options:HitchyOptions, handle:HitchyPluginHandle ): void;

    /**
     * Gets invoked before loading and exposing components of plugin.
     *
     * @param options options used on invoking application
     * @param handle current plugin's handle
     */
    onExposing?( this:HitchyAPI, options:HitchyOptions, handle:HitchyPluginHandle ): void;

    /**
     * Gets invoked after having loaded and exposed components of plugin.
     *
     * @param options options used on invoking application
     * @param handle current plugin's handle
     */
    onExposed?( this:HitchyAPI, options:HitchyOptions, handle:HitchyPluginHandle ): void;

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
    initialize?( this:HitchyAPI, options:HitchyOptions, handle:HitchyPluginHandle ): void;

    /**
     * Gets invoked on gracefully shutting down Hitchy-based application.
     *
     * This callback is meant to release either plugin's resources if required.
     *
     * @param options options used on invoking application
     * @param handle current plugin's handle
     */
    shutdown?( this:HitchyAPI, options:HitchyOptions, handle:HitchyPluginHandle ): void;
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

/**
 * Logs provided message on behalf of a particular logging facility.
 */
export type LoggerFunction = ( message: string ) => void;

/**
 * Represents essential subset of either Hitchy-based application's
 * configuration.
 */
export interface HitchyConfig {
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

export type HitchyRoutingConfig = HitchyRoutingDeclaration | HitchyRoutingSlotDeclaration;

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

export type HitchyRoutingTargetDeclaration = HitchyRoutingTargetFunction | HitchyRoutingTargetName | HitchyRoutingTargetDescriptor;
export type HitchyRoutingTargetFunction = HitchyRequestControllerHandler | HitchyRequestPolicyHandler;
export type HitchyRoutingTargetName = String;
export interface HitchyRoutingTargetDescriptor {
    module: HitchyControllerComponent | HitchyPolicyComponent;
    method: HitchyRequestControllerHandler | HitchyRequestPolicyHandler;
    args?: any[];
}

/**
 * Defines signature of a controller's request handler.
 */
export type HitchyRequestControllerHandler = ( this: HitchyRequestContext, req: HitchyIncomingMessage, res: HitchyServerResponse, ...customParameters: any[] ) => Promise<any>;

/**
 * Defines signature of a policy's request handler.
 */
export type HitchyRequestPolicyHandler = ( this: HitchyRequestContext, req: HitchyIncomingMessage, res: HitchyServerResponse, next: ( error?: Error ) => void, ...customParameters: any[] ) => Promise<any>;

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
export interface HitchyIncomingMessage {

}

/**
 * Partially re-declares ServerResponse supported by Node.js.
 */
export interface NodeJsServerResponse {
    end( content?: ( string | Buffer ), encoding?: string ): void;
    write( content: ( string | Buffer ), encoding?: string ): void;
    writeHead( statusCode: number, headers: { [key: string]: string } ): void;
    setHeader( headersOrName: ( { [key: string]: string } | string ), value: string ): void;
    getHeader( name: string ): string;
    statusCode: number;
}

/**
 * Extends ServerResponse of Node.js in context of a Hitchy-based application.
 */
export interface HitchyServerResponse extends NodeJsServerResponse {
    send( content: ( string | Buffer ), encoding?: string ): HitchyServerResponse;
    status( statusCode: number ): HitchyServerResponse;
    type( typeName: string ): HitchyServerResponse;
    format( handlers: { [key: string]: HitchyRequestControllerHandler } ): HitchyServerResponse;
    json( data: object ): HitchyServerResponse;
    set( headersOrName: ( { [key: string]: string } | string ), value: string ): HitchyServerResponse;
    redirect( statusCode: number, url: string ): HitchyServerResponse;
}

export type HitchyBodyParser = ( raw: Buffer ) => ( any | Promise<any> );

/**
 * Describes context via `this` in request handlers of a Hitchy-based
 * application.
 */
export interface HitchyRequestContext {
    accept: string[];
    cookies?: { [key: string]: string };
    fetchBody( parser?: boolean | HitchyBodyParser );
    hitchy: HitchyAPI;
    params: { [key: string]: string | string[] };
    path: string;
    query: { [key: string]: string | string[] }
    session?: { [key: string]: any }
}
