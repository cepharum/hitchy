import { IncomingMessage, ServerResponse } from "http";
import { EventEmitter } from "events";

export = hitchy;

declare namespace hitchy {
    /**
     * Describes instance of Hitchy suitable for injecting into some server.
     */
    interface HitchyInstance {
        /**
         * Exposes name of injector used to create this instance of Hitchy.
         */
        injector: string;

        /**
         * Promises Hitchy instance being ready for handling requests.
         */
        onStarted: Promise<HitchyAPI>;

        /**
         * Provides callback for shutting down Hitchy instance.
         */
        stop(): Promise<any>;

        /**
         * Exposes instance of Hitchy API as used by this Hitchy instance.
         */
        api: HitchyAPI;

        /**
         * Exposes instance of Hitchy API as used by this Hitchy instance.
         */
        hitchy: HitchyAPI;
    }

    /**
     * Describes instance of Hitchy suitable for injecting into Node.js HTTP server.
     */
    interface HitchyNodeInstance extends HitchyInstance {}

    /**
     * Describes instance of Hitchy suitable for injecting into Connect/Express
     * application as middleware.
     */
    interface HitchyConnectInstance extends HitchyInstance {}

    /**
     * Provides all Hitchy-related information available in modules and functions of
     * a Hitchy-based application.
     */
    interface HitchyAPI extends HitchyLibraryAPI {
        /**
         * Exposes application's current runtime configuration.
         */
        config: HitchyConfig;

        /**
         * Exposes application's meta information read from files package.json
         * and/or hitchy.json in application's root folder.
         */
        meta: object;

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

        /**
         * Intentionally crashes Hitchy-based service.
         *
         * @param cause cause of crash
         * @return promises Hitchy instance and request listener being torn down
         */
        crash( cause: Error ): Promise<any>;

        /**
         * Intentionally shuts down Hitchy-based service.
         *
         * @return promises Hitchy instance and request listener being torn down
         */
        shutdown(): Promise<any>;
    }

    /**
     * Provides elements of Hitchy's API distributed as part of its core and thus
     * instantly available at start of bootstrap.
     */
    interface HitchyLibraryAPI extends EventEmitter {
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

        /**
         * Resolves provided folder in relation to current project's folder.
         *
         * The provided name may start with `@hitchy/` to be resolved in relation to
         * folder containing currently used hitchy instance.
         *
         * @param folder name to be resolved
         */
        folder: (folder: string) => string;
    }

    type HitchyCMP = (this: HitchyAPI, options: HitchyOptions, ...customArgs: any[]) => any;

    interface HitchyRouterAPI {
        dispatch( context:HitchyRequestContext ): Promise<HitchyRequestContext>;

        client: HitchyRouterClient;
    }

    interface HitchyResponderAPI {
        normalize( context:HitchyRequestContext ): HitchyRequestContext;
    }

    interface HitchyUtilityAPI {
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

        value: {
            /**
             * Detects boolean keyword in provided string returning related boolean
             * value or provided string if detection fails.
             *
             * @param input string to be inspected
             * @returns boolean value detected in provided string
             */
            asBoolean(input: string): boolean|string,
        },

        logger: HitchyLoggerGenerator,
    }

    /**
     * Selects a strategy of merging a particular property when deeply merging to
     * objects.
     */
    enum HitchyMergeStrategy {
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
    interface HitchyRouterClient {
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
    interface HitchyRouterClientOptions {
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
    interface HitchyOptions {
        /**
         * Selects folder containing application to be presented.
         */
        projectFolder: string;

        /**
         * Selects root folder of current instance of Hitchy framework.
         */
        hitchyFolder: string;

        /**
         * Selects separate folder containing node_modules/ subfolder w/ Hitchy
         * plugins to be discovered. Omit to use same folder as `projectFolder`.
         */
        pluginsFolder?: string;

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
         * Lists folders of plugins to be loaded explicitly.
         */
        explicitPlugins?: String[];

        /**
         * Set true for loading explicitly provided plugin folders, only.
         */
        explicitPluginsOnly?: boolean;

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
    interface HitchyPlugins {
        [key: string]: HitchyPluginAPI;
    }

    /**
     * Maps available plugins' name into either plugin's handle.
     */
    interface HitchyPluginHandles {
        [key: string]: HitchyPluginHandle;
    }

    /**
     * Describes common elements of some plugin's API.
     */
    interface HitchyPluginAPI {
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
         * Gets invoked after global configuration has been compiled from either
         * plugin's as well as application's particular configuration.
         *
         * @param options options used on invoking application
         * @param handle current plugin's handle
         */
        configure?(this: HitchyAPI, options: HitchyOptions, handle: HitchyPluginHandle): void;

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
         * Provides plugin's routing declarations of policies.
         */
        policies?: HitchyPluginRoutingDeclaration;

        /**
         * Provides plugin's routing declarations of terminal routes.
         */
        routes?: HitchyPluginRoutingDeclaration;

        /**
         * Provides plugin's routing declarations of blueprint routes.
         */
        blueprints?: HitchyPluginRoutingDeclaration;

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
    interface HitchyPluginHandle {
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

    type HitchyLoggerGenerator = (facility: string) => HitchyLoggerFunction;

    /**
     * Logs provided message on behalf of a particular logging facility.
     */
    type HitchyLoggerFunction = (message: string) => void;

    /**
     * Represents essential subset of either Hitchy-based application's
     * configuration.
     */
    interface HitchyConfig {
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
    interface HitchyCoreConfig {
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

    type HitchyRoutingConfig =
        HitchyRoutingDeclaration
        | HitchyRoutingSlotDeclaration;

    /**
     * Describes routing declarations grouped by routing slot for explicit
     * separation.
     */
    interface HitchyRoutingSlotDeclaration {
        early?: HitchyRoutingDeclaration;
        before?: HitchyRoutingDeclaration;
        after?: HitchyRoutingDeclaration;
        late?: HitchyRoutingDeclaration;
    }

    /**
     * Lists routing sources mapped into routing targets.
     */
    interface HitchyRoutingDeclaration {
        [key: string]: HitchyRoutingTargetDeclaration;
    }

    type HitchyRoutingDeclarationProvider = (this: HitchyAPI, options: HitchyOptions, handle: HitchyPluginHandle) => ( HitchyRoutingDeclaration | Promise<HitchyRoutingDeclaration> );
    type HitchyPluginRoutingDeclaration = HitchyRoutingDeclarationProvider | HitchyRoutingDeclaration | Promise<HitchyRoutingDeclaration>;

    type HitchyRoutingTargetDeclaration =
        HitchyRoutingTargetFunction
        | HitchyRoutingTargetName
        | HitchyRoutingTargetDescriptor;
    type HitchyRoutingTargetFunction =
        HitchyRequestControllerHandler
        | HitchyRequestPolicyHandler;
    type HitchyRoutingTargetName = String;

    interface HitchyRoutingTargetDescriptor {
        module: HitchyControllerComponent | HitchyPolicyComponent;
        method: HitchyRequestControllerHandler | HitchyRequestPolicyHandler;
        args?: any[];
    }

    /**
     * Defines signature of a controller's request handler.
     */
    type HitchyRequestControllerHandler = (this: HitchyRequestContext, req: HitchyIncomingMessage, res: HitchyServerResponse, ...customParameters: any[]) => Promise<any>;

    /**
     * Defines signature of a policy's request handler.
     */
    type HitchyRequestPolicyHandler = (this: HitchyRequestContext, req: HitchyIncomingMessage, res: HitchyServerResponse, next: (error?: Error) => void, ...customParameters: any[]) => Promise<any>;

    /**
     * Defines collections of components grouped by type of component.
     */
    interface HitchyRuntime {
        controllers: HitchyControllerComponents;
        controller: HitchyControllerComponents;
        policies: HitchyPolicyComponents;
        policy: HitchyPolicyComponents;
        models: HitchyModelComponents;
        model: HitchyModelComponents;
        services: HitchyServiceComponents;
        service: HitchyServiceComponents;
    }

    interface HitchyControllerComponents {
        [key: string]: HitchyControllerComponent;
    }

    interface HitchyPolicyComponents {
        [key: string]: HitchyPolicyComponent;
    }

    interface HitchyModelComponents {
        [key: string]: HitchyModelComponent;
    }

    interface HitchyServiceComponents {
        [key: string]: HitchyServiceComponent;
    }

    interface HitchyComponent {
    }

    type HitchyControllerComponent = HitchyComponent;
    type HitchyPolicyComponent = HitchyComponent;
    type HitchyModelComponent = HitchyComponent;
    type HitchyServiceComponent = HitchyComponent;

    /**
     * Extends IncomingMessage of Node.js in context of a Hitchy-based application.
     */
    interface HitchyIncomingMessage extends IncomingMessage {
        hitchy: HitchyAPI;
        api: HitchyAPI;
        context: HitchyRequestContext;
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
    interface HitchyServerResponse extends ServerResponse {
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
    type HitchyBodyParser = (raw: Buffer) => (any | Promise<any>);

    /**
     * Describes context via `this` in request handlers of a Hitchy-based
     * application.
     */
    interface HitchyRequestContext {
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

    enum HitchyContextIdentifier {
        Standalone= "standalone",
        Express= "express",
    }
}
