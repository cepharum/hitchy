# Hitchy Plugins

In this topic you learn how to write plugins for Hitchy. It is also introducing common API of either plugin as assumed by Hitchy to be integrated properly.

## Naming

A plugin's name is equivalent to the base name of folder containing it. Thus, every plugin must be available in a separate folder.

:::tip Example
A plugin locally available in folder **/app/node_modules/hitchy-plugin-foo** is named **hitchy-plugin-foo**.
:::

:::warning Convention
When publishing plugins for Hitchy as packages on npm or similar their name should start with **hitchy-plugin-** by convention. See the [moderated list of existing plugins](../plugins.md) for examples.
:::

## Roles

In addition to its name every plugin is assumed _to claim a role_ it is taking as part of an application. This role's name is identical to the plugin's name by default. But every plugin is able to choose a different role explicitly.

### Why Using Roles?

Roles are beneficial for creating complex applications. By supporting plugin roles it is possible to have different implementations for the same purpose resulting in same API available under same name - the role's name - at runtime.

:::tip Example
The plugin hitchy-plugin-odem is claiming role **odm**. Its API is exposed at runtime as `api.plugins.odm`. 

A different plugin may be designed as a drop-in replacement for **hitchy-plugin-odem** by claiming same role **odm** and providing same API with a different implementation e.g. for interacting with a different backend for storing data.
:::

### Static vs. Dynamic vs. Approved

For every plugin a claimed role may be encountered in these situations:

1. In its **hitchy.json** beacon file (see below) a plugin may claim role explicitly or rely on role equivalent to its name by default. This role is called the plugin's _static role_.

2. A plugin's API may include property `$meta` to be merged with information read from its **hitchy.json** file before. This may include a `role` in turn which is called the plugin's _dynamic role_.

3. One of these roles - preferring the dynamic role over the static one - becomes the plugin's _approved role_ which is going to be only considered one while integrating either plugin with the application. 

   The approved role of a plugin will be exposed as property `$role` of its API.

### Uniquity

A plugin's role must be unique in context of a single application. 

Thus, in a single application you can't have two plugins claiming same role except for one situation: A plugin's dynamic role is accepted over always preferred over some other plugin claiming same role statically, only. This is meant to have a plugin inspecting all the available plugins and deciding to provide a superior implementation to be used in preference.


## Basic File Layout

### Minimally Required Files

Every plugin must be implemented in its own folder. 

This is achieved implicitly when distributing plugins as packages via npm. The folder's name is implicitly assumed to be the plugin's name.

Every plugin's folder must contain at least two files:

* **hitchy.json** is called the plugin's [_beacon file_](#the-beacon-file) for indicating that a folder is actually containing a Hitchy-compatible plugin. That's why **this file must exist**. 

* **index.js** must be provided for exporting the plugin's API. That API is used in two situations:

  1. It is used to integrate the plugin with an application that is based on Hitchy. 
  
     This is the [part which is described below](#common-plugin-api).
  
  2. It may expose additional information and methods for use by the application at runtime. Therefore, it will be exposed as part of a collection in [Hitchy's API](README.md#api-plugins) using the plugin's role name.
  
     This [part of API](#a-plugin-s-particular-api) is optional and depends on actual plugin. 
     
  ```javascript
  module.exports = function( options, pluginHandles, myHandle ) {
      const api = this;

      return {
          // TODO: list elements of plugin's API here
      };
  };
  ```
  
  Complying with [common module pattern](README.md#using-common-module-pattern) is highly suggested to use the [full potential of integrating with an application](../internals/bootstrap.md#validating-claimed-roles). But it's not required and thus it's okay to export the plugin's API without:

  ```javascript
  module.exports = {
      // TODO: list elements of plugin's API here
  };
  ```
  
  :::tip
  Using [package.json](https://docs.npmjs.com/files/package.json#main) it is possible to select a different name used for loading plugin's API.
  :::

As a result any plugin's folder should look similar to this layout:

```
+ hitchy-plugin-foo
    hitchy.json
    index.js
```

### Configuration

Every plugin may provide configuration to be merged into resulting application's configuration by providing a sub-folder **config** containing one or more Javascript files each exposing another part of desired configuration.

```
+ hitchy-plugin-foo
  + config
      foo.js
      bar.js  
    hitchy.json
    index.js
```

Names of configuration files don't matter as long as they don't start with a full stop `.` and end in **.js**.

Either plugin's configuration as merged data of all files loaded here is exposed as [part of plugin's resulting API](#plugin-config-0-3-3). Configuration of all plugins and resulting application is merged and gets eventually exposed via [Hitchy's API](README.md#api-config).

### Components

Just like the application itself every plugin may expose [components](../internals/components.md) to be discovered and exposed via Hitchy's API. Thus, a plugin may contain a folder **api** which in turn may contain any combination of the sub-folders **controllers**, **policies**, **models** and **services**.

:::tip Singular Names
Using singular names for those four folders is supported as well.
:::

```
+ hitchy-plugin-foo
  + api
    + controllers
        foo.js
    + policies
        bar.js
    + services
        foo.js
        bar.js
    + models
        foo.js
  + config
      foo.js
      bar.js  
    hitchy.json
    index.js
```

Discovered components are exposed via [Hitchy's API](README.md#api-runtime).


## The Beacon File

Every folder or package meant to be discovered as a Hitchy plugin must contain a file named **hitchy.json**. This file doesn't have to contain any information and thus could be as simple as this:

```json
{}
```

The file is used as a _beacon_ indicating its folder to contain a plugin for Hitchy. By relying on its presence discovering plugins is pretty fast resulting in shorter startup times.

There may be actual content in the file, though. 

* The content is playing an essential part in integrating either plugin as it might describe a plugin's slight deviation from API assumed by Hitchy. 

* It may give explicit values for defaults assumed otherwise. 

* Another option is declaring other plugins either plugin depends on. This is resulting in a certain dependency graph which is used to create a properly sorted list of plugins obeyed while integrating them with an application as well as on routing requests through routes exposed by either plugin.

Last but not least there may be custom information which is [exposed as part of either plugin's API](#plugin-meta).

### role

This property of **hitchy.json** file is statically claiming a certain [role](#roles) by name. It defaults to the plugin's name which in turn is equivalent to the filename of folder containing the **hitchy.json** file.

In opposition to that either plugin gets a chance to claim a different role dynamically e.g. after inspecting whole list of actually discovered plugins.

### dependencies

Either plugin may declare _roles_ of plugins it depends on. This affects bootstrap in several ways:

* When sorting plugins for sequential processing any plugin listing roles as its dependencies here is processed after those plugins claiming either role.

* If any of the declared dependencies is missing the bootstrap fails cancelling whole application startup.

:::tip Example
The plugin **hitchy-plugin-odem-rest** is declaring to depend on role **odm** which is claimed by plugin **hitchy-plugin-odem**.

**hitchy-plugin-odem-rest/hitchy.json:**
```json
{
	"role": "odm-provider",
	"dependencies": [
		"odm"
	]
}
```
:::

### dependants

A plugin is capable of listing roles depending on it without requiring plugins claiming those roles to declare related dependency on their own. 

Using this property is less common but supported for sake of integrity as it is controlling sorting order of plugins in direction opposite to declaring dependencies as described above.


## Common Plugin API

This is a summary of properties and methods in a plugin's API supported by Hitchy for integrating the plugin with an application. See the [description of process integrating plugins](../internals/bootstrap.md) for additional information.

:::tip
There are no two kinds of APIs for every plugin. But some properties of a plugin's API are detected and handled by Hitchy on integrating the plugin with an application while the rest of that API is ignored by Hitchy.
:::

### plugin.$name

This property names the plugin which is exposing this API.

### plugin.$role

This property names the role claimed by plugin exposing this API. Since accessing the plugin involves knowing the role this information may be considered redundant but is included for sake of integrity.

### plugin.$meta

When exported by [a plugin's **index.js** file](#basic-file-layout) this property is meant to provide information extending and/or replacing related information found in plugin's beacon file.

After [loading plugin in discovery stage](../internals/bootstrap.md#loading-plugins) exported information is merged with any information found in beacon file. Thus, this object is eventually providing final state of a plugin's meta information.

### plugin.$index

Due to sorting plugins for sequential processing either plugin has an index into that list which is exposed in this property mostly for testing purposes.

### plugin.$config <Badge type="info">0.3.3+</Badge>

When loading configuration files of a plugin a single object merged from information exported by either found file is exposed as part of plugin's API. The information is also merged with related configuration objects of all other plugins and the application itself into one [global configuration object](README.md#api-config-0-3-0).

### plugin.onDiscovered()

**Signature:** `onDiscovered( options, pluginHandles, myHandle )`

This optional method is invoked on all eventually integrated plugin's APIs have been loaded. At this point every plugin's API has been loaded and is available as part of provided [handles](../internals/bootstrap.md#a-plugin-s-handle).

:::tip
Plugins may be discovered but fail to be integrated with the application eventually. This is mostly due to [loosing claimed role](../internals/bootstrap.md#validating-claimed-roles) to another plugin.
:::

### plugin.configure()

**Signature:** `configure( options, myHandle )`

This optional method is invoked at end of configuration stage to request either plugin for fixing any [configuration read from its files](#configuration).

:::tip
Returning a promise is supported for deferring bootstrap until promise is settled. On rejecting promise or on throwing the bootstrap fails.
:::

### plugin.onExposing()

**Signature:** `onExposing( options, myHandle )`

This optional method is invoked at start of exposure stage right before detecting either plugin's components and exposing them in [Hitchy's API](README.md#api-runtime).

:::tip
Returning a promise is supported for deferring bootstrap until promise is settled. On rejecting promise or on throwing the bootstrap fails.
:::

### plugin.onExposed()

**Signature:** `onExposed( options, myHandle )`

This optional method is invoked at end of exposure stage after having detecting and [exposed](README.md#api-runtime) either plugin's components.

:::tip
Returning a promise is supported for deferring bootstrap until promise is settled. On rejecting promise or on throwing the bootstrap fails.
:::

### plugin.initialize()

**Signature:** `initialize( options, myHandle )`

This optional method is invoked so the plugin is able to initialise its resources e.g. by connecting to some database.

:::tip
Returning a promise is supported for deferring bootstrap until promise is settled. On rejecting promise or on throwing the bootstrap fails.
:::

### plugin.policies

**Signatures:** `policies` or `policies( options, myHandle )`

This optional property or method is used to fetch a plugin's routing declarations for policies during [routing stage of bootstrap](../internals/bootstrap.md#routing). It is either an object with structure equivalent to the one [supported in configuration](README.md#config-policies) or some method invoked in compliance with [common module function pattern](README.md#common-module-function-pattern) to get that set of declarations.

:::tip
In addition, it is possible to expose this property as a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises) which is fulfilled with the actual set of routing declarations.
:::

:::warning Supporting "Slots"
In opposition to an application's custom routing declarations, a plugin is capable of choosing virtual routing slots `before` and `after`, only. In opposition to application's support for routing slots those names are used to pick the [block of policies either preceding or succeeding the block of routes](../internals/routing-basics.md#routing-stages). 
:::

### plugin.routes

**Signatures:** `routes` or `routes( options, myHandle )`

Similar to [`plugin.policies`](#plugin-policies) this optional property or method is used to fetch plugin's routing declarations for (terminal) routes during [routing stage of bootstrap](../internals/bootstrap.md#routing). See its [configuration counterpart](README.md#config-routes) for information on supported syntax.

:::tip
In addition, it is possible to expose this property as a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises) which is fulfilled with the actual set of routing declarations.
:::

:::warning Supporting "Slots"
In opposition to an application's custom routing declarations, a plugin is capable of choosing virtual routing slots `before` and `after`, only. In opposition to application's support for routing slots those names are used to pick the [block of routes either preceding or succeeding the block of blueprint routes](../internals/routing-basics.md#focusing-on-routes). 
:::

### plugin.blueprints

**Signatures:** `routes` or `routes( options, myHandle )`

Similar to [`plugin.routes`](#plugin-routes) this optional property or method is used to fetch plugin's routing declarations for [blueprint routes](../internals/routing-basics.md#focusing-on-routes) during [routing stage of bootstrap](../internals/bootstrap.md#routing). The supported syntax is basically identical to the one supported by `plugin.routes`, though blueprints are limited in multiple ways:

:::tip
In addition, it is possible to expose this property as a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises) which is fulfilled with the actual set of routing declarations.
:::

:::warning Supporting "Slots"
When it comes to declaring blueprints there is no support for selecting any kind of _routing slot_. Thus, declarations of blueprint routes don't support sub-divisions like policies or routes.
:::

### plugin.shutdown()

**Signature:** `shutdown( options, myHandle )`

This optional method is invoked on gracefully shutting down Hitchy-based application. it is meant to enable a plugin to release its resources e.g. by disconnecting from some database.

:::tip
Returning a promise is supported for deferring bootstrap until promise is settled.
:::


## A Plugin's Particular API

In addition to complying with Hitchy's Plugin API every plugin may expose its own API to be made available via [Hitchy's API](README.md#api-plugins) available at runtime of a Hitchy-based application.

A plugin's API is specific to either plugin and thus you should consult the plugin's documentation.

:::tip
There are no two kinds of APIs for every plugin. But some properties of a plugin's API are detected and handled by Hitchy on integrating the plugin with an application while the rest of that API is ignored by Hitchy.

The API eventually exposed via Hitchy's API is always covering both parts of a plugin's API.
:::
