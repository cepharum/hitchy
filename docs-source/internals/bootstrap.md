# Integrating Plugins

On startup Hitchy is discovering available plugins and integrating them with the application. This topic is providing a brief description of this so called _bootstrap operation_ which is divided into several [_bootstrap stages_](../internals/architecture-basics.md#discovering-plugins).

## Triangulation

During triangulation phase there is no interaction with plugins for they haven't been discovered yet. It is mostly about Hitchy processing options customizing its behaviour and detecting an application's project folder as well its folder assumed to contain any available plugin.

In triangulation Hitchy is qualifying some of the supported [options](../api/README.md#options). And it tries to find base folder of project to be managed by Hitchy unless it has been given on invocation explicitly.

:::tip Finding Application Folder
Unless providing application's project folder on invocation Hitchy is checking one of these supported use cases accepting the first one matching:

1. Hitchy assumes current working directory is project folder of application to be managed. The folder is accepted when containing sub-folder named **node_modules**. Otherwise parent folder of current working directory is tried. This process is repeated until either root folder of local file system has been reached or some folder containing **node_modules** has been found.

2. Hitchy assumes to be installed as a dependency of its application or some dependency of a dependency of its application etc. In this case it is starting at its own folder assumed to be contained in a **node_modules** folder itself, thus testing its grandparent folder.
:::


## Discovery

:::warning Discovery Stage Is Crucial
This stage is very important for finding all available plugins and settle any "dispute" when multiple available plugins claiming to take same role in resulting application.
:::

### Finding Plugins

In discovery stage Hitchy is searching local filesystem for folders containing **hitchy.json** file. On every match the containing folder is considered an available Hitchy plugin. The **hitchy.json** file is read providing _static_ meta information on either plugin.

:::tip Folders Searched For Plugins
By default, Hitchy is starting at application's folder. There it is deeply searching for any sub-folder in **./node_modules** containing a file named **hitchy.json**. It is ignoring folders marked as hidden by name starting with a period.

It is possible to explicitly select different folder to start searching as described before using option [**pluginsFolder**](../api/README.md#options-pluginsfolder).

It is possible to provide an explicit list of folders containing plugins and their dependencies to be discovered using option [**explicitPlugins**](../api/README.md#options-explicitplugins). Plugins discovery can be limited to those explicitly provided plugins using option [**explicitPluginsOnly**](../api/README.md#options-explicitpluginsonly).
:::

### Loading Plugins

For every plugin its folder is loaded as a module using `require()` while supporting compliance with [common module pattern](../api/README.md#using-common-module-pattern). A plugin must provide an **index.js** file or [select a different file](https://docs.npmjs.com/files/package.json#main) to be actually loaded.

The loaded module is considered the plugin's API.

This API may include _dynamic_ meta information in its property `$meta`. It is basically used to extend the plugin's static meta information. This extended meta information is replacing API's property `$meta` eventually.

:::warning Risks
At this stage plugins are loaded in arbitrary order. Thus you can't rely on every other plugin's API being loaded already. You might need to cache available handle instead and wait for `onDiscovered()` notification described below.
:::

### Validating Claimed Roles

Hitchy is passing additional information on loading a plugin which is complying with common module pattern. In addition to its highly rudimentary API provided as `this` and its [options](../api/README.md#options) provided in first argument it is passing

* a dictionary mapping every basically discovered plugin's name into either one's rudimentary [handle](#a-plugin-s-handle) in second argument and
* notified plugin's own handle in third argument.

Plugins may use this opportunity for dynamically claiming to take a role after inspecting available plugins. Whenever claiming to take a role dynamically every static claim for the same role is dropped probably resulting in plugins stripped off any role.

:::tip Example
A plugin may be included to claim a role unless some other plugin is doing so. In this situation the former is meant to be a fallback for the latter.

In a different scenario a plugin might detect another plugin it basically depends on for deriving from its API. The former plugin would claim same role as the latter one. This dynamic claim to take a role is replacing any plugin's static claim for the same role.
:::

### A Plugin's Handle

Every plugin is exporting an API mostly used for integrating the plugin with a Hitchy-based application. It is thus essential in upcoming stages of bootstrap.

During bootstrap every discovered plugin is additionally represented by another object which is internally known as _the plugin's handle_. Every handle comes with these properties:

* `handle.name` is providing the plugin's name.
* `handle.staticRole` is providing the plugin's role claimed in its **hitchy.json** file.
* `handle.folder` is providing the folder the plugin has been loaded from.
* `handle.meta` is providing the plugin's loaded, merged and probably qualified meta information.
* `handle.api` is finally providing the API exported by the plugin.
* `handle.config` provides individual configuration of plugin read from its **config** folder in configuration stage.


### Notifying Plugins on Discovery

Next, every plugin with an approved role which is exporting a method called `onDiscovered()` as part of its API gets notified on being discovered by invoking that function. This _notification handler_ is assumed to comply with [common module function pattern](../api/README.md#common-module-function-pattern) and thus is invoked with `this` referring to Hitchy's still rudimentary API and with
 
* [Hitchy's options](../api/README.md#options),
* a dictionary mapping either discovered plugin's name into its [handle](#a-plugins-handle) and
* the [handle](#a-plugins-handle) of current plugin exporting the notification handler

as function arguments.

This notification is meant to provide APIs and meta information of all basically discovered plugins to those plugins with approved roles. The latter ones are assumed to cache references on APIs they intend to use prior to Hitchy dropping them.

:::warning Don't rely on sorting order!
Plugins are notified in arbitrary order here. All succeeding notifications are processed in a certain order, though.
:::

### Dropping Plugins

Next, plugins with their static roles dropped as described before are dropped. They won't make it into Hitchy's API and thus won't be available at runtime directly, but still might be used internally by some of the other plugins.

:::tip
Even though explicitly selecting additional folders to contain plugins using option [**explicitPlugins**](../api/README.md#options-explicitplugins) either of these plugins may be dropped for claiming a role neither application nor any of its plugins depend on. You may claim roles explicitly using option [**dependencies**](../api/README.md#options-dependencies).
:::

### Sorting Plugins

For all leftover plugins a dependency graph is compiled. All plugins are sorted accordingly from plugin most other plugins rely on to those ones no other plugin relies on.

:::tip
Any follow-up action regarding _every plugin_ is obeying this sorting order now. In shutdown stage as well as in handling late policies this order is reversed. 
:::


## Exposure

:::warning Compatibility
Starting with version 0.4.0 this stage has swapped its position with [configuration stage](#configuration).
:::

Exposure stage is meant to compile and expose components in section [`api.runtime` of Hitchy's API](../api/README.md#api-runtime).

### Early Notification

This stage starts with another notification called [`onExposing()`](../api/plugins.md#plugin-onexposing). It is giving first opportunity to inspect the final list of actually available plugins as some of the initially discovered ones might have been replaced by [others claiming the same role dynamically](../api/plugins.md#roles).

Every interested plugin must export a method called `onExposing()` as part of its API. Just like before, the function is invoked with `this` referring to still partial Hitchy API and Hitchy options as well as the notified plugin's handle as arguments.

### Collecting, Deriving, Replacing

Components of every plugin are processed before processing components of application.

In either case components are processed [type](architecture-basics.md#components) by type. For every component another Javascript file is expected in either type of component's sub-folder **api/controllers**, **api/policies** etc. 

:::tip
Starting with v0.3.3 Hitchy is deeply searching in either folder. Providing special meta information [per plugin](../api/plugins.md#deepcomponents-badge) or [application](components.md#exposure-at-runtime) the previous behaviour can be restored for either plugin or application.
:::

Every found Javascript file is loaded to export the component's API. This might be any kind of data. Usually, it is a class or an object of functions. It is exposed as part of [Hitchy's API](../api/README.md#api-runtime) at runtime using a [name that is derived from found file's name](components.md#derivation-of-component-names). 

Either component's module may comply with [common module pattern](../api/README.md#using-common-module-pattern). In this case the exported  function is invoked with `this` referring to Hitchy's API in its current state and Hitchy's options in first argument as usual. In addition, however, some existing component of same name to be replaced by loaded one is passed in second argument so the new component is capable of deriving from that existing one.

:::tip Example
Assume some plugin is providing same service module as another plugin it depends on. The module could look like this:

**api/service/crypto.js:**
```javascript
module.exports = function( options, ExistingCryptoService ) {
    return class RevisedCryptoService extends ExistingCryptoService {
        // TODO provide some implementation here
    };
};
```
:::

### Final Notification

Just like in previous stages a notification is dispatched by invoking method `onExposed()` for every plugin that's exporting this function as part of its API. Its signature is equivalent to that one of `onExposing()` described before.


## Configuration

:::warning Compatibility
Starting with version 0.4.0 this stage has swapped its position with [exposure stage](#exposure).
:::

In configuration stage the application's configuration is compiled from every plugin and the application itself. 

### Collecting & Compiling

Every plugin as well as the application is assumed to provide zero or more non-hidden configuration files implemented as Javascript modules in sub-folder **config**. Every file in that sub-folder that does not start with a full stop `.` and ends with **.js** is assumed to export another part of eventual configuration.

Hitchy is reading all those files merging them into a single configuration object which is exposed as part of Hitchy's API at `api.config`.

:::tip Special Case: local.js
Every plugin as well as the application may use a file **config/local.js** which is always processed after having processed all the other configuration files in a folder. This helps with safely declaring defaults prior to providing a custom configuration for the current installation which might be deviating from those defaults.
:::

### Final Notification

After having compiled this object every plugin is notified by invoking method `configure()` optionally available in either plugin's API. The function is invoked with `this` referring to Hitchy's partially compiled API and Hitchy options as well as the notified plugin's handle as arguments.


## Initialisation

In initialisation stage configuration and all components are available. Every plugin gets opportunity to initialise its state for runtime, e.g. by establishing connections to databases or similar.

:::tip
[Shutdown stage](#shutdown) is supported as a counterpart to this stage.
:::

### Initialising Plugins

For every plugin a method `initialize()` exported as part of its API is invoked. The function is invoked with `this` referring to Hitchy's API and Hitchy options as well as either plugin's handle provided as arguments.

### Initialising Application

Application may provide its initialisation code to be invoked after having initialised all plugins. Applications requiring special setup provide a file named **initialize.js** in project folder. This file is invoked in compliance with common module pattern. 

**app/initialize.js**
```javascript
module.exports = function( options ) {
    const api = this;

    // TODO implement your application here, e.g. by setting up caches or similar
};
```

## Routing

:::tip Dedicated Stage For Routing
Routing stage is a dedicated stage at end of bootstrap so it is capable of using APIs, components and configuration of existing plugins and the application for eventually declaring routes.
:::

In routing stage every plugin is asked to provide its routing declarations in one of two ways:

1. Using configuration files just like the application either plugin can declare routing of [`policies`](routing-basics.md#policies), (terminal) [`routes`](routing-basics.md#routes) and [`blueprints`](routing-basics.md#focusing-on-routes).

   Those routings will be part of global configuration object exposed via Hitchy's API at runtime, as well. But either plugin's configuration as well as the routing configuration of application is processed independently.
   
   :::warning
   This option has been introduced in v0.3.6.
   :::

2. The preferred way is to expose either set of declarations as part of a [plugin's API](../api/plugins.md#common-plugin-api). `policies`, `routes` and/or `blueprints` can be exposed as object containing declarations or as function to be invoked in compliance with common module (function) pattern to return either set of declarations there.

   :::tip Hidden Routings
   This approach is preferred to prevent useless pollution of [configuration object](../api/README.md#configuration).
   :::
 
After that application's configuration is processed accordingly for `routes` and `policies`.

Routing declarations aren't replacing existing ones on match, but might cause some declarations inferior to others to be dropped when optimising routing tables. For additional information on this rather complex method see the separate [introduction on routing](../internals/routing-basics.md).

At the end of routing stage the application's bootstrap has finished.

## Shutdown

When gracefully shutting down a Hitchy-based application every plugin gets a chance to shutdown its previously initialised state. The same applies to the application which gets a chance to do so first.

### Shutting Down Application

On behalf of application a file named **shutdown.js** found in its project folder is loaded complying with common module pattern.

**app/shutdown.js**
```javascript
module.exports = function( options ) {
    const api = this;

    // TODO remove caching files of your application or similar here
};
```

### Shutting Down Plugins

After that for every plugin is checked for exporting a method `shutdown()` to be invoked now. Either function is invoked with `this` referring to Hitchy's API and Hitchy options as well as either plugin's handle provided as arguments.

:::tip Reversed Order
In opposition to any preceding stage plugins are processed in reversed order so that plugins having initialised their state first are requested to shut it down last.
:::
