export interface HitchyApi {
    config: HitchyConfig;
    runtime: HitchyRuntime;
    plugins: HitchyPlugins;
    log( facility: string ): LoggerFunction;
    data: object;
}

interface HitchyOptions {
    projectFolder: string;
    hitchyFolder: string;
    extensionsFolder?: string;
    debug?: string;
}

interface HitchyPlugins {
    [key: string]: HitchyPluginAPI;
}

interface HitchyPluginHandles {
    [key: string]: HitchyPluginHandle;
}

interface HitchyPluginAPI {
    $name: string;
    $role: string;
    $meta: object;
    $config: object;
    onDiscovered?( this:HitchyApi, options:HitchyOptions, plugins:HitchyPluginHandles, handle:HitchyPluginHandle ): void;
    configure?( this:HitchyApi, options:HitchyOptions, handle:HitchyPluginHandle ): void;
    onExposing?( this:HitchyApi, options:HitchyOptions, handle:HitchyPluginHandle ): void;
    onExposed?( this:HitchyApi, options:HitchyOptions, handle:HitchyPluginHandle ): void;
    initialize?( this:HitchyApi, options:HitchyOptions, handle:HitchyPluginHandle ): void;
    shutdown?( this:HitchyApi, options:HitchyOptions, handle:HitchyPluginHandle ): void;
}

interface HitchyPluginHandle {
    name: string;
    staticRole: string;
    folder: string;
    config: object;
    meta: object;
    api: HitchyPluginAPI;
}

type LoggerFunction = ( message: string ) => void;

interface HitchyConfig {
    routes?: HitchyRoutingConfig;
    policies?: HitchyRoutingConfig;
    blueprints?: HitchyRoutingConfig;
    hitchy: HitchyCoreConfig;
}

interface HitchyCoreConfig {
    appendFolders?: boolean;
    deepComponents?: boolean;
}

type HitchyRoutingConfig = HitchyRoutingDeclaration | HitchyRoutingSlotDeclaration;

interface HitchyRoutingSlotDeclaration {
    early?: HitchyRoutingDeclaration;
    before?: HitchyRoutingDeclaration;
    after?: HitchyRoutingDeclaration;
    late?: HitchyRoutingDeclaration;
}

interface HitchyRoutingDeclaration {
    [key: string]: HitchyRoutingTargetDeclaration;
}

type HitchyRoutingTargetDeclaration = HitchyRoutingTargetFunction | HitchyRoutingTargetName | HitchyRoutingTargetDescriptor;
type HitchyRoutingTargetFunction = HitchyRequestControllerHandler | HitchyRequestPolicyHandler;
type HitchyRoutingTargetName = String;

interface HitchyRoutingTargetDescriptor {
    module: HitchyControllerComponent | HitchyPolicyComponent;
    method: HitchyRequestControllerHandler | HitchyRequestPolicyHandler;
    args?: any[];
}

type HitchyRequestControllerHandler = ( req: HitchyIncomingMessage, res: HitchyServerResponse, ...customParameters: any[] ) => Promise<any>;
type HitchyRequestPolicyHandler = ( req: HitchyIncomingMessage, res: HitchyServerResponse, next: ( error?: Error ) => void, ...customParameters: any[] ) => Promise<any>;

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

interface HitchyIncomingMessage {

}

interface HitchyServerResponse {

}
