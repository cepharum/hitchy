# Integrating Plugins

This topic is providing a brief description of Hitchy's bootstrap operation and the way it is discovering and integrating available plugins.

On startup Hitchy is discovering available plugins and integrating them with the application. This process is tightly bound to [bootstrap stages](../internals/architecture-basics.md#discovering-plugins).

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
By default, Hitchy is starting at application's folder. There it is deeply searching for any sub-folder in **./node_modules** containing a file named **hitchy.json**. It is ignoring folders marked as hidden by name with leading period.

It is possible to explicitly select different folder to start from using option **extensionFolder**.

Mostly for testing purposes it is possible provide a list of folders to be considered plugin folders explicitly using option **explicitExtensions**. It is also possible to prevent Hitchy from searching folder mentioned before by setting option **explicitFoldersOnly**. Neither option is supported by Hitchy's CLI script, though.
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

* a dictionary mapping every basically discovered plugin's name into either one's rudimentary handle in second argument and
* notified plugin's own handle in third argument.

Plugins may use this opportunity for dynamically claiming to take a role after inspecting available plugins. Whenever claiming to take a role dynamically every static claim for the same role is dropped probably resulting in plugins stripped off any role.

:::tip Example
A plugin may be included to claim a role unless some other plugin is doing so. In this situation the former is meant to be a fallback for the latter.

In a different scenario a plugin might detect another plugin it basically depends on for deriving from its API. The former plugin would claim same role as the latter one. This dynamic claim to take a role is replacing any plugin's static claim for the same role.
:::

#### A Plugin's Handle

Every plugin is exporting an API mostly used for integrating the plugin with a Hitchy-based application. It is thus essential in upcoming stages of bootstrap.

During bootstrap every discovered plugin is additionally represented by another object which is internally known as _the plugin's handle_. Every handle comes with these properties:

* `handle.name` is providing the plugin's name.
* `handle.staticRole` is providing the plugin's role claimed in its **hitchy.json** file.
* `handle.folder` is providing the folder the plugin has been loaded from.
* `handle.meta` is providing the plugin's loaded, merged and probably qualified meta information.
* `handle.api` is finally providing the API exported by the plugin.
:::


### Notifying Plugins on Discovery

Next, every plugin exporting a method called `onDiscovered()` as part of its API is notified on being discovered by invoking that function. This notification handler is invoked with `this` referring to Hitchy's still rudimentary API. Arguments passed are
 
* Hitchy options,
* a dictionary mapping either discovered plugin's name into its [handle](#a-plugins-handle) and
* the handle of current plugin exporting the function invoked.

This notification is meant to indicate the moment when all plugins' handles have been populated with either plugin's API. At this point a plugin may rely on plugin handles it has cached before when replacing another plugin by dynamically claiming same role.

:::warning Risks
Notifying plugins is still happening in arbitrary order here.
:::

### Dropping Plugins

Next, plugins with their static roles dropped as described before are dropped. They won't make it into Hitchy's API and thus won't be available at runtime directly, but still might be used internally by some of the other plugins.

### Sorting Plugins

For all leftover plugins a dependency graph is compiled. All plugins are sorted accordingly from plugin most other plugins rely on to those ones no other plugin relies on.

:::tip
Any follow-up action regarding _every plugin_ is obeying this sorting order. In shutdown stage as well as in handling late policies the order is reversed. 
:::


## Configuration

In configuration stage the application's configuration is compiled from every plugin and the application itself. 

### Collecting & Compiling

Every plugin as well as the application is assumed to provide one or more configuration files with extension **.js** in sub-folder **config**. Hitchy is reading all those files merging them into a single configuration object which is exposed as part of Hitchy's API at `api.runtime.config`.

### Final Notification

After having compiled this object every plugin is notified by invoking method `configure()` optionally available in either plugin's API. Either function is invoked with `this` referring to Hitchy's partially compiled API and Hitchy options as well as either plugin's handle as arguments.

## Exposure

Exposure stage is meant to compile components listed in section `api.runtime` of Hitchy's API.

### Early Notification

This stage starts with a notification called `onExposing()`. This notification is useful for accessing final configuration for the first time. 

Every interested plugin must export a method called `onExposing()` in its API. Just like before, the function is invoked with `this` referring to still partial Hitchy API and Hitchy options as well as either plugin's handle as arguments.

### Collecting, Deriving, Replacing

After that, components of every plugin are loaded prior to loading those provided by current application.

Found components are instantly exposed in Hitchy's API so that plugins as well as the application are able to see those components e.g. for deriving new components from those exposed by preceding plugins. In addition every plugin may replace previously exposed components by re-exposing another component with the same name.

### Final Notification

Just like in previous stages a notification is dispatched by invoking method `onExposed()` for every plugin that's exporting this function as part of its API. Its signature is equivalent to that one of `onExposing()` described before.

## Initialisation

In initialisation stage configuration and all components are available. Every plugin gets opportunity to initialise its state for runtime, e.g. by establishing connections to databases or similar.

:::tip
[Shutdown stage](#shutdown) is supported as a counterpart to this stage.
:::

For every plugin a method `initialize()` exported as part of its API is invoked. The function is invoked with `this` referring to Hitchy's API and Hitchy options as well as either plugin's handle provided as arguments.

Application may provide its initialisation code to be invoked after having initialised all plugins. Applications requiring special setup provide a file named **initialize.js** in project folder. This file is invoked in compliance with common module pattern. 

## Routing

In routing stage the routing definitions in configuration of every plugin are processed resulting in routes for later dispatch of request. Routes are read from configuration properties `routes`, `policies` and `blueprints`.

After that application's configuration is processed accordingly for `routes` and `policies`.

Routing definitions aren't replacing existing ones on match. For additional information on this rather complex method see the separate [introduction on routing](../internals/routing-basics.md).

At the end of routing stage the application's bootstrap has finished.

## Shutdown

When gracefully shutting down a Hitchy-based application every plugin gets a chance to shutdown its previously initialised state. The same applies to the application which gets a chance to do so first.

On behalf of application a file named **shutdown.js** found in its project folder is loaded complying with common module pattern.

After that for every plugin is checked for exporting a method `shutdown()` to be invoked now. Either function is invoked with `this` referring to Hitchy's API and Hitchy options as well as either plugin's handle provided as arguments.

:::tip Reversed Order
In opposition to any preceding stage plugins are processed in reversed order so that plugins having initialised their state first are requested to shut it down last.
:::
