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

This pattern is beneficial in plugins dynamically adopting their behaviour to an application's actual context. For example, a plugin may inspect list of available plugins and decide to replace some particular plugin unless application doesn't depend on that plugin at all.

### Uniquity

A plugin's [approved role](#static-vs-dynamic-vs-approved) must be unique in context of a single application. Thus, in a single application you can't have two plugins claiming same role to be approved.


## Basic File Layout

### Minimally Required Files

Every plugin must be implemented in its own folder. 

This is achieved implicitly when distributing plugins as packages via npm. The folder's name is implicitly assumed to be the plugin's name.

Every plugin's folder must contain at least two files:

* **hitchy.json** is called the plugin's [_beacon file_](#the-beacon-file) for indicating that a folder is actually containing a Hitchy-compatible plugin. That's why **this file must exist**. 

* **index.js** must be provided for exporting the plugin's API. That API is used in two situations:

  1. It is used to integrate the plugin with an application that is based on Hitchy. 
  
     This is the [part which is described below](#common-plugin-api).
  
  2. It may expose additional information and methods for use by the application at runtime. Therefore, it will be exposed as part of a collection in [Hitchy's API](hitchy.md#api-plugins) using the plugin's role name.
  
     This [part of API](#a-plugin-s-particular-api) is optional and depends on actual plugin. 
     
  ```javascript
  module.exports = function( options, pluginHandles, myHandle ) {
      const api = this;

      return {
          // TODO: list elements of plugin's API here
      };
  };
  ```
  
  Complying with [common module pattern](../internals/patterns.md#common-module-pattern) is highly suggested to use the [full potential of integrating with an application](../internals/bootstrap.md#validating-claimed-roles). But it's not required and thus it's okay to export the plugin's API without:

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

Either plugin's configuration as merged data of all files loaded here is exposed as [part of plugin's resulting API](#plugin-config). Configuration of all plugins and resulting application is merged and gets eventually exposed via [Hitchy's API](hitchy.md#api-config).

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

Discovered components are exposed via [Hitchy's API](hitchy.md#api-runtime).


## The Beacon File

Every folder or package meant to be discovered as a Hitchy plugin must contain a file named **hitchy.json**. It does not have to contain any information and thus could be as simple as this:

```json
{}
```

The file is used as a _beacon_ indicating its folder to contain a plugin for Hitchy. By relying on its presence discovery of plugins is pretty fast resulting in shorter startup times.

There may be actual content in the file, though, which is used to compile the plugin's [meta information](#meta-information). 

## Meta Information

Every plugin has meta information attached. It may be explicitly provided in one of two sources:

* The [beacon file](#the-beacon-file) is providing a plugin's _static meta information_.

* The plugin's API exported from its [**index.js** file](#basic-file-layout) may expose its _dynamic meta information_.

Both sources are merged into single set of meta information with data found in latter source replacing data found in former one.

There are elements of meta information Hitchy is using while integrating discovered plugins. These are described below. Hitchy is assuming defaults or deriving values e.g. from a plugin's name when meta information lacks either element.

In addition a plugin's meta information may contain custom data which isn't used by Hitchy for integrating the plugin. It might be used by plugins or the application at runtime [using Hitchy's API](hitchy.md#api-plugins).

:::tip
Due to being processed in [discovery stage of bootstrap](../internals/bootstrap.md#discovery) meta information is available early and thus may be used to customize upcoming [stages of bootstrap](../internals/architecture-basics.md#discovering-plugins).
:::

### role

Every plugin has to claim a certain [role](#roles) by name. It defaults to the plugin's name which in turn is equivalent to the filename of folder containing the plugin's **hitchy.json** file.

:::tip
Read more about [roles of plugins](#roles).
:::

:::tip Example
The plugin **hitchy-plugin-odem** claims to take role **odm** in an application. It can do so in its **hitchy.json** file:

**hitchy-plugin-odem/hitchy.json:**
```json
{
    "role": "odm"
}
```

It can do so via its exported API as well:

**hitchy-plugin-odem/index.js:**
```javascript
module.exports = {
    $meta: {
        role: "odm",
    },
};
```
:::

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

A plugin is capable of listing roles depending on it without requiring plugins claiming those roles as dependency on their own.

This feature is important for controlling order of plugins to assure some plugin is processed between two other ones. 

:::tip Example
A plugin with role **auth** is working with a model **User** and thus claims to depend on plugin with role **odm** using a beacon file similar to this one:

```json
{
    "role": "auth",
    "dependencies": ["odm"]
}
```

A plugin **fast-user** wants to transparently provide a different implementation for that model and thus needs to make sure it is processed after plugin with role **odm** and before plugin with role **auth**. It's achieving that by using a beacon file like this one:

```json
{
    "role": "fast-user",
    "dependencies": ["odm"],
    "dependants": ["auth"]
}
```
:::


### deepComponents <Badge type="info" text="0.4.0"></Badge>

When loading components of a plugin this boolean property controls whether Hitchy is deeply searching for components in either type of component's sub-folder or not. Deep search is enabled by default.

:::tip Example
When set or omitted, a file **api/controllers/user/management.js** is discovered and exposed as `api.runtime.controllers.UserManagement`. Otherwise this particular file isn't discovered and therefore won't be exposed at all as it isn't found in **api/controllers** directly.
:::

:::warning Compatibility
In versions 0.3.3 through 0.3.6 this option was available as [`config.hitchy.deepComponents`](hitchy.md#configuration). Moving it into meta information was in support for swapping exposure and configuration stages of bootstrap.

Versions before v0.3.3 did not support deep searching components at all. Due to enabling it by default now you need to explicitly set this property `false` to keep the previous behaviour.
:::

:::warning Risk of Conflicts
When deeply searching components two different files might be exposed under the same name due to the way files in sub-folders are processed.

A file **api/controllers/management/user.js** is discovered as **management/user.js**. The [derived name](../internals/components.md#derivation-of-component-names) for the component would be **UserManagement**.

A file **api/controllers/user-management.js** is discovered as **user-management.js**. The resulting component would be named **UserManagement** as well.

Deeply searching for components processes files before sub-folders, so in this example the former would be exposed last and thus replacing the latter.
:::

### appendFolders <Badge type="info" text="0.4.0"></Badge>

When deeply searching for components Hitchy is [using the relative path name of every component's module for deriving the resulting component's name](../internals/components.md#derivation-of-component-names). This option is controlling whether names of containing sub-folders are prepended to files' base names in given order or appended to them in reverse order. 

The latter case is used by default so you need to explicitly set this property `false` to establish the former case.

:::tip Example
Consider an application with a **api/services** looking like this:

```
+ api/services
  + management
    + user
        system-admin.js
        guest.js
      room.js  
```

By default this results in exposing these service components:

* **SystemAdminUserManagement**
* **GuestUserManagement**
* **RoomManagement**

When setting `appendFolder` to be false the resulting service components are exposed like this:

* **ManagementUserSystemAdmin**
* **ManagementUserGuest**
* **ManagementRoom**
:::

:::warning Compatibility
In versions 0.3.3 through 0.3.6 this option was available as [`config.hitchy.appendFolders`](hitchy.md#configuration). It has been moved to support swapping exposure and configuration stages of bootstrap.

Versions before v0.3.3 did not support deep searching components at all. Thus, this option wasn't supported either.
:::



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

When exported by [a plugin's **index.js** file](#basic-file-layout) this property is meant to provide information extending and/or replacing related information found in plugin's [beacon file](#the-beacon-file).

After [loading plugin in discovery stage](../internals/bootstrap.md#loading-plugins) exported information is merged with any information found in beacon file. Thus, this object is eventually providing final state of a plugin's meta information.

### plugin.$index

Due to sorting plugins for sequential processing either plugin has an index into that list which is exposed in this property mostly for testing purposes.

### plugin.$config <Badge type="info" text="0.3.3"></Badge>

When loading configuration files of a plugin a single object merged from information exported by either found file is exposed as part of plugin's API. The information is also merged with related configuration objects of all other plugins and the application itself into one [global configuration object](hitchy.md#api-config).

### plugin.onDiscovered()

**Signature:** `onDiscovered( options, pluginHandles, myHandle )` ([CMFP](../internals/patterns.md#common-module-function-pattern))

This optional method is invoked on all eventually integrated plugin's APIs have been loaded. At this point every plugin's API has been loaded and is available as part of provided [handles](../internals/bootstrap.md#a-plugin-s-handle) which is a dictionary mapping either plugin's _name_ into its handle. This dictionary includes discovered plugins that are dropped in favour of others.

:::tip
Plugins may be discovered but fail to be integrated with the application eventually. This is mostly due to [loosing claimed role](../internals/bootstrap.md#validating-claimed-roles) to another plugin.
:::

### plugin.onExposing()

**Signature:** `onExposing( options, myHandle )` ([CMFP](../internals/patterns.md#common-module-function-pattern))

This optional method is invoked at start of exposure stage right before detecting either plugin's components and exposing them in [Hitchy's API](hitchy.md#api-runtime).

:::tip
Returning a promise is supported for deferring bootstrap until promise is settled. On rejecting promise or on throwing the bootstrap fails.
:::

### plugin.onExposed()

**Signature:** `onExposed( options, myHandle )` ([CMFP](../internals/patterns.md#common-module-function-pattern))

This optional method is invoked at end of exposure stage after having detecting and [exposed](hitchy.md#api-runtime) either plugin's components.

:::tip
Returning a promise is supported for deferring bootstrap until promise is settled. On rejecting promise or on throwing the bootstrap fails.
:::

### plugin.configure()

**Signature:** `configure( options, myHandle )` ([CMFP](../internals/patterns.md#common-module-function-pattern))

This optional method is invoked at end of configuration stage to request either plugin for fixing any [configuration read from its files](#configuration).

:::tip
Returning a promise is supported for deferring bootstrap until promise is settled. On rejecting promise or on throwing the bootstrap fails.
:::

### plugin.initialize()

**Signature:** `initialize( options, myHandle )` ([CMFP](../internals/patterns.md#common-module-function-pattern))

This optional method is invoked so the plugin is able to initialise its resources e.g. by connecting to some database.

:::tip
Returning a promise is supported for deferring bootstrap until promise is settled. On rejecting promise or on throwing the bootstrap fails.
:::

### plugin.policies

**Signatures:** `policies` or `policies( options, myHandle )` ([CMFP](../internals/patterns.md#common-module-function-pattern))

This optional property or method is used to fetch a plugin's routing declarations for policies during [routing stage of bootstrap](../internals/bootstrap.md#routing). It is either an object with structure equivalent to the one [supported in configuration](hitchy.md#config-policies) or some method invoked in compliance with [common module function pattern](../internals/patterns.md#common-module-function-pattern) to get that set of declarations.

:::tip
In addition, it is possible to expose this property as a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises) which is fulfilled with the actual set of routing declarations.
:::

:::warning Supporting "Slots"
In opposition to an application's custom routing declarations, a plugin is capable of choosing virtual routing slots `before` and `after`, only. In opposition to application's actual support for routing slots those names are used to pick the [block of policies either preceding or succeeding the block of routes](../internals/routing-basics.md#routing-stages). 
:::

### plugin.routes

**Signatures:** `routes` or `routes( options, myHandle )` ([CMFP](../internals/patterns.md#common-module-function-pattern))

Similar to [`plugin.policies`](#plugin-policies) this optional property or method is used to fetch plugin's routing declarations for (terminal) routes during [routing stage of bootstrap](../internals/bootstrap.md#routing). See its [configuration counterpart](hitchy.md#config-routes) for information on supported syntax.

:::tip
In addition, it is possible to expose this property as a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises) which is fulfilled with the actual set of routing declarations.
:::

:::warning Supporting "Slots"
In opposition to an application's custom routing declarations, a plugin is capable of choosing virtual routing slots `before` and `after`, only. In opposition to application's actual support for routing slots those names are used to pick the [block of routes either preceding or succeeding the block of blueprint routes](../internals/routing-basics.md#focusing-on-routes). 
:::

### plugin.blueprints

**Signatures:** `routes` or `routes( options, myHandle )` ([CMFP](../internals/patterns.md#common-module-function-pattern))

Similar to [`plugin.routes`](#plugin-routes) this optional property or method is used to fetch plugin's routing declarations for [blueprint routes](../internals/routing-basics.md#focusing-on-routes) during [routing stage of bootstrap](../internals/bootstrap.md#routing). The supported syntax is basically identical to the one supported by `plugin.routes`, though blueprints are limited in multiple ways:

:::tip
In addition, it is possible to expose this property as a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises) which is fulfilled with the actual set of routing declarations.
:::

:::warning Supporting "Slots"
When it comes to declaring blueprints there is no support for selecting any kind of _routing slot_. Thus, declarations of blueprint routes don't support sub-divisions like policies or routes.
:::

### plugin.shutdown()

**Signature:** `shutdown( options, myHandle )` ([CMFP](../internals/patterns.md#common-module-function-pattern))

This optional method is invoked on gracefully shutting down Hitchy-based application. It is meant to enable a plugin to release its resources e.g. by disconnecting from some database.

:::tip
Returning a promise is supported for deferring bootstrap until promise is settled.
:::


## A Plugin's Particular API

In addition to complying with Hitchy's Plugin API every plugin may expose its own API to be made available via [Hitchy's API](hitchy.md#api-plugins) available at runtime of a Hitchy-based application.

A plugin's API is specific to either plugin and thus you should consult the plugin's documentation.

:::tip
There are no two kinds of APIs for every plugin. But some properties of a plugin's API are detected and handled by Hitchy on integrating the plugin with an application while the rest of that API is ignored by Hitchy.

The API eventually exposed via Hitchy's API is always covering both parts of a plugin's API.
:::

:::tip Example
A plugin named **my-plugin** and claiming role **widgets** exposes an API like this:

**my-plugin/index.js:**
```javascript
class Widget {
}

module.exports = {
    createWidget( name ) { ... },
    Widget,
};
```

The application is capable of using this API using `api.plugins.widgets.createWidget( name )` or `new api.plugins.widgets.Widget()`.
:::
