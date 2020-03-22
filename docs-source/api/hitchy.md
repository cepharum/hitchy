# Hitchy's API

In this topic you learn [how to access Hitchy's API](#gaining-access) in components of your application. It provides a detailed introduction of [features exposed in that API](#api-elements). 

Regarding request handling, there is an introduction of special [context for every request handler](#request-context) and additional properties and methods provided as part of [request](#request-helpers) and [response](#response-helpers) descriptors provided as arguments there.


:::tip Event Support
Starting with v0.5.0 Hitchy's API is derived from [EventEmitter](https://nodejs.org/dist/latest/docs/api/events.html#events_class_eventemitter) and thus capable of emitting and dispatching events accordingly.
:::

## Gaining Access

In a fully running application Hitchy's API is available

* in every plugin complying with one of two patterns named _common module pattern_ and _common module function pattern_,
* in any function invoked on routing a request, that is
  * inline functions used in routing configurations,
  * methods of a controller and
  * methods of a policy.

### Using Common Module Pattern

As a Node.js developer you are familiar with the traditional way of writing modules. Plugins and components discovered by Hitchy are (consisting of) such modules and thus might look like this:

```javascript
module.exports = {
    create() {
        // add some code here
    },
    customFunction() {
        // add some code here
    }, 
};
```

This example shows a software module that's exposing two functions forming its API.

In addition to those modules, Hitchy's core supports so called _common module pattern_ when _discovering_ plugins and their components.

:::warning Discovering Plugins?
In Hitchy _discovering_ a plugin is different from _requiring_ it. The term discovery refers to Hitchy's capability of [automatically loading a plugin during bootstrap](../internals/architecture-basics.md#discovering-plugins). In opposition to that, any code of your application may still `require()` modules the usual way. **However, this is going to have some negative side effects for modules relying on _common module pattern_**. That's why we suggest to stick with this pattern most of the time. 
::: 

Instead of exporting some API, the common module pattern is a convention allowing either complying module to export a function generating its API on invocation. This function is invoked by Hitchy's bootstrap code in a controlled context to get the module's actual API:

```javascript
module.exports = function( options ) {
    const api = this;

    return {
        create() {
            // add some code here
        },
        customFunction() {
            // add some code here
        }, 
    };
};
```

In this example the same API is exposed as before. But this time it is relying on the common module pattern mostly to gain access on Hitchy's API in line two. During discovery of plugins and components any function exported by either module is invoked with Hitchy's API provided as `this` and global options describing runtime context and arguments passed on starting Hitchy in first argument.

Following this pattern is beneficial in several ways:

* Your modules are gaining access to [runtime options](#options) and Hitchy's common API described in this document.

* Because of that, either module may provide different implementations depending on current runtime environment. 

  :::tip
  It's always wise choice to put **everything** into that function.
  :::

* Defer bootstrap of your application by [returning promises](#returning-promise) so you get all the time required to decide how to proceed.

And, of course, all this applies to configuration files as well.

:::warning Related Issues
On exporting an ES6 class in a module Hitchy might falsely consider this module to comply with common module pattern.

```javascript
class MyServiceComponent {
    // TODO add methods here
}

module.exports = MyServiceComponent;
```

This results in error on Hitchy start regarding invoking your exposed class without operator `new`. As a fix you might need to wrap this class in a function to actually comply with common module pattern. 

```javascript
module.exports = function() {
    class MyServiceComponent {
        // TODO add methods here
    }

    return MyServiceComponent;
};
```

Alternatively you might add static property `useCMP` set `false` to prevent Hitchy from assuming this module is complying with common module pattern.

```javascript
class MyServiceComponent {
    // TODO add methods here
    
    static get useCMP() { return false; }
}

module.exports = MyServiceComponent;
```
:::

#### Returning Promise

Another benefit of complying with common module patterns is available on module's function returning a Promise for the module's API instead of that API directly. In that case Hitchy is waiting for the promise to be resolved with the actually desired API.

This way it is possible to defer bootstrap code of Hitchy and wait for prerequisites required for delivering module's API eventually.

```javascript
module.exports = function( options ) {
    const api = this;

    return someAsynchronousCode()
        .then( () => {
            return {
                create() {
                    // add some code here
                },
                customFunction() {
                    // add some code here
                }, 
            };
        } );
};
```

#### Passing Additional Information

Whenever Hitchy is supporting common module pattern it might intend to pass further information in addition to its API and options. This information will be provided as additional arguments following provided options.

#### Common Module Function Pattern

A similar pattern is supported e.g. when accessing some [elements of a plugin's API](plugins.md#common-plugin-api) and it is named _common module function pattern_. Just like common module pattern it is meant to support provision of a function to be invoked for generating some data instead of providing that data immediately. And any such function is invoked with Hitchy's API provided as `this`, Hitchy's options in first argument and any number of additional data provided in further arguments, too.

In opposition to common module pattern this isn't about a whole module to be loaded but just some property exported there. And for the containing module to be capable of complying with common module pattern using this pattern isn't quite as beneficial and commonly useful except for rare cases. **That's why we suggest to stick with [common module pattern](#using-common-module-pattern) whenever possible.**

### In Request Handlers

In request handlers the API is exposed in two different ways:

1. Every request handler is invoked with `this` referring to some [_request context_](#request-context) which is including [reference on Hitchy's API in property `api`](#this-api):

   ```javascript
   function someRequestHandler( req, res ) {
       // access Hitchy's API via this.api here ...
   }
   ```

2. Starting with v0.2.0 the API is exposed as property `hitchy` of given request descriptor as well. This enables use of arrow functions and helps with accessing the API in nested functions and callbacks more easily:

   ```javascript
   ( req, res ) => {
       // access Hitchy's API via req.hitchy here ...
   }
   ```

## Options

When talking about common module pattern before there was an argument passed providing so called _Hitchy options_. 

Basically this is a set of parameters provided on invoking Hitchy. Usually this is done via Hitchy's CLI script. Thus, provided options are related to parameters provided on running CLI script. However, when testing Hitchy and its plugins it is possible to pass options from testing scripts as well.

```bash
hitchy /app --pluginFolder /some/different/path --debug
```

There are options recognized by Hitchy and some of those get qualified during [bootstrap](../internals/architecture-basics.md#discovering-plugins). 

Additionally provided parameters are included with options available in common module pattern. That's why your application is implicitly capable of supporting custom CLI options for controlling its behaviour.

```bash
hitchy /app --useAuthProvider https://some.auth.provider.com
```

These are options recognized and/or managed by Hitchy:

### options.debug

This boolean option is controlling whether debug output is desired or not. Basically this option affects Hitchy to always enable any [logging facility](#api-log).

:::tip CLI Parameter
When using Hitchy's CLI the related parameter is called `--debug`.
:::

### options.dependencies

This option is supported to select plugins current application depends on. It is replacing any such list of plugins read from application's own **hitchy.json** file. In addition it is limiting set of eventually available plugins.

:::tip CLI Parameter
When using Hitchy's CLI the related parameter is called `--depend-on`. It can be provided multiple times.
:::

### options.explicitPlugins <Badge type="info" text="0.4.0"></Badge>

This option is explicitly listing folders containing plugins and their local dependencies. 

In opposition to more commonly useful option [**pluginsFolder**](#options-pluginsfolder) this option is also checking the provided folder itself for implementing some plugin.

:::tip CLI Parameter
When using Hitchy's CLI the related parameter is called `--plugin`. It can be provided multiple times.
:::

### options.explicitPluginsOnly <Badge type="info" text="0.4.0"></Badge>

This boolean option can be set to limit discovery of plugins to those folders listed explicitly using option [**explicitPlugins**](#options-explicitplugins).

:::tip CLI Parameter
When using Hitchy's CLI the related parameter is called `--explicit-only`.
:::

### options.hitchyFolder

This option is defined by Hitchy during triangulation stage of bootstrap. It is addressing folder containing Hitchy installation used to manage currently running application.

:::tip CLI Parameter
There is no related CLI parameter for using Hitchy's CLI script already requires to pick its installation folder.
:::

### options.pluginsFolder

This option is picking different folder containing all available plugins in a **node_modules** sub-folder. The [project folder](#options-projectfolder) is used in case of omitting this option.

:::tip CLI Parameter
When using Hitchy's CLI the related parameter is called `--plugins`.
:::

### options.projectFolder

This option is qualified during triangulation stage of bootstrap. It is addressing folder containing currently running application. When omitted current working directory is used by default.

:::tip CLI Parameter
When using Hitchy's CLI the related parameter is called `--project`.
:::


## Configuration

During [bootstrap](../internals/architecture-basics.md#discovering-plugins) Hitchy is _shallowly_ reading Javascript files available in sub-folder **config** of your application as well as of any plugin. Either file is assumed to export part of resulting configuration:

```javascript
exports.part = { ... };
```

Either file may comply with [common module pattern](#using-common-module-pattern) e.g. to gain access on [Hitchy's options](#options) and [its API](#api-elements) or to provide its configuration asynchronously by returning Promise.

```javascript
module.exports = function( options ) {
    const api = this;

    return checkSomeSource()
        .then( info => {
            return {
                part: { ... },
            };
        } );
};
```

All files' exports are merged into one configuration object which is exposed at runtime as [`api.config`](#api-config) in modules complying with [common module pattern](#using-common-module-pattern) and as [`this.config`](#this-config) in request handlers.

:::tip Rules For Naming Files
A configuration file's name 

* **must not** start with a full stop `.` and 
* **must** have extension **.js**. 

Apart from that you may choose any name you like. 

As a convention, though, there is another file for every first-level property of resulting configuration object with the filename matching that property's name. So, configuration for `config.routes` would be found in file **config/routes.js** and it is exporting related part of configuration like this:

```javascript
exports.routes = { ... };
```
:::

:::tip Order of Processing
For every plugin as well as the application itself all its configuration files are sorted by name and processed in resulting order. Application's files are processed after either plugin's configuration.

In either context a file named **config/local.js** is always processed last. It is meant to contain local-only customizations for all other files which are part of distributed application.
:::

The structure of configuration depends on used plugins and it might include arbitrary information specific to your application, as well. However, some properties are supported by Hitchy's core and they are listed below:

### config.blueprints

:::warning
By intention, blueprints are supported in plugins, only.
:::

:::tip Hitchy's Routing Concept
Reading the [introduction on Hitchy's routing](../internals/routing-basics.md) is highly recommended.
:::

Declaration of blueprints is mostly equivalent to declaring routes in [`config.routes`](#config-routes). In opposition to that blueprint declarations don't support separate lists per _routing slot_ for there is only one slot for every plugin to declare its blueprint routes.

### config.bodyParser

This property is exposing a function invoked with a buffer representing a request's raw body. It is invoked to parse this buffer for some contained information provided on invoking [`req.fetchBody()`](#req-fetchbody-parser) without any parameter. The function may return promise to deferredly deliver parsed content.

### config.policies

:::tip Hitchy's Routing Concept
Reading the [introduction on Hitchy's routing](../internals/routing-basics.md) is highly recommended.
:::

This property is exposing routing declarations of [policies](../internals/routing-basics.md#policies). Policies can be declared in plugins as well as in application.

The supported format is mostly identical to the one supported for `config.routes` below. 

:::tip
See [`config.routes`](#config-routes) for additional information.
:::

These are the differences between policies and routes:

* When declaring policies targets are addressing [policy components](../internals/components.md#policies) instead of [controller components](../internals/components.md#controllers).

* Targets of a route may be declared with optional suffix **Controller**. When declaring policy targets the supported suffix is **Policy** instead.

  ```javascript
  config.routes = {
      "/some/route": "FooController.action",
  };
  config.policies = {
      "/some/route": "FooPolicy.action",
  };
  ```

* When declaring routes every source must be linked with exactly one target. When declaring policies every source may also have a list of targets to be processed in order. 

  **bad:**
  ```javascript
  config.routes = {
      "/some/route": [
          "FooController.action",
          "FooController.altAction",
      ],
  };
  ```

  **good:**
  ```javascript
  config.routes = {
      "/some/route": "FooController.action",
  };
  config.policies = {
      "/some/route": [
          "FooPolicy.action",
          "FooPolicy.altAction",
      ],
  };
  ```

### config.routes

:::tip Hitchy's Routing Concept
Reading the [introduction on Hitchy's routing](../internals/routing-basics.md) is highly recommended.
:::

This property is exposing declarations of (terminal) [routes](../internals/routing-basics.md#routes).

:::warning Required
Routes are essential in Hitchy for it doesn't know how to handle incoming requests otherwise.
:::

A set of routing declarations is given as [Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object) or as a [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) with the latter assuring certain order of processing, though this isn't quite as important in most cases due to Hitchy's routing preferring to match longer sources over shorter ones.

The set may be divided into slots for providing different sets per [routing slot](../internals/routing-basics.md#routing-slots). Supported names for dividing declarations are **early**, **before**, **after** and **late**. By default, routing declarations are applied to **before** slot.

:::warning
Providing declarations per routing slot is not supported for plugins.
:::

Every single declaration is associating a _routing source_ with a _routing target_. 

* The source is a string optionally selecting an HTTP method and mandatorily providing a pattern to be matched by a request's URL path. Patterns are supported using [path-to-regexp](https://www.npmjs.com/package/path-to-regexp). 

  Here are some valid examples:

  ```
  "/some/path"
  "GET /api/:model/:id"
  "POST /api/:model/write/:id"
  "ALL /api/:model"
  ```
  
  When omitting provision of HTTP method it defaults to `GET`.

* The target is given 

  * as a regular function,
  
    ```javascript
    "/some/route": function( req, res ) {
        // TODO implement this handler
    }
    ```

  * as an arrow function,
  
    ```javascript
    "/some/route": ( req, res )  => {
        // TODO implement this handler
    }
    ```
  
  * as a string describing function exposed by available [controller component](../internals/components.md#controllers) or
  
    ```javascript
    "/some/route": "FooController.action",
    "/some/route": "Foo.action", // equivalent for "Controller" is optional
    "/some/route": "Foo::action", // equivalent, just in case you prefer this notation style
    ```
  
  * as an object selecting function exposed by available [controller component](../internals/components.md#controllers).
  
    ```javascript
    "/some/route": { module: "FooController", method: "action" },
    "/some/route": { module: "Foo", method: "action" },
    "/some/route": { module: "Foo" }, // default for "method" is "index"
    "/some/route": { controller: "Foo" },
    "/some/route": { policy: "Foo" },
    ```
    
    :::tip
    **controller** and **policy** are just aliases for **module** supported for readability, only. They don't enable use of controllers in declaring policies or use of policies in declaring routes.
    :::
    
    Using this most complex syntax it is possible to declare additional arguments provided on invoking either request handler:
    
    ```javascript
    "/some/route": { module: "Foo", method: "action", args: [
        "foo",
        "bar"
    ] },
    ```
    
    Those arguments are appended to the regularly provided arguments `req`, `res` and - in case of policies, only - `next`:

    ```javascript
    // in api/controllers/foo.js
    exports.action = function( req, res, foo, bar ) {
        // foo will contain "foo" due to given declaration
        // bar will contain "bar" due to given declaration
    }
    ```

:::tip Regular Example
```javascript
exports.routes = {
    "/some/route": "FooController.action",
    "/api/:model": { module: "ModelController" },
    "/api/:model/:id"( req, res ) {
        res.end( "Hello World!" );
    },
}
```
:::

:::tip Example With Routing Slots
```javascript
exports.routes = {
    early: {
        "/some/route": "FooController.action",
        "/api/:model": { module: "ModelController" },
    },
    after: {
        "/api/:model/:id"( req, res ) {
            res.end( "Hello World!" );
        },
    }
}
```
:::


## API Elements

Hitchy's API can be divided into several sections to be described here.

:::tip
The following description assumes you know [how to gain access on Hitchy's API](#gaining-access) in either situation, thus referring to it using just `api`. 
:::

### api.Client

This class is providing router client suitable for locally triggering request dispatching.

:::warning Obey The Naming!
This class is exposed using PascalCase name to comply with common rules of code style linters.
:::

This client can be used to simulate requests for testing purposes, for improved request processing e.g. via websockets or for locally triggering request handlers e.g. for transparently rewriting requests or similar.

:::tip Example
```javascript
const client = new api.Client( {
    method: "POST", 
    url: "/some/internal/url?foo=bar",
    headers: {
        "content-type": "text/json",
    },
} );

client.end( JSON.stringify( { some: "input" } ) );

return client.dispatch()
    .then( res => {
        if ( res.statusCode === 200 ) {
            return res.body()
                .then( body => JSON.parse( body.toString( "utf8" ) ) )
                .then( data => {
                    // TODO: process response
                } );
        }
    } );
```
:::

:::tip
This client simulates _most_ parts of [ClientRequest](https://nodejs.org/dist/latest/docs/api/http.html#http_class_http_clientrequest) and [ServerResponse](https://nodejs.org/dist/latest/docs/api/http.html#http_class_http_serverresponse). In addition method `res.body()` is provided to simplify retrieval of response body.
:::

### api.cmfp

**Signature:** `api.cmfp( someFunction, [ arg1, arg2 ] )`

This method is invoking some function provided by reference with support for _common module function pattern_. This pattern is derived from [common module pattern](#using-common-module-pattern) and is meant to invoke particular functions of plugins in a similar way.

Invoked functions are assumed to expect Hitchy's API as `this` and global options provided in first argument which is implicitly prepended by this method.

### api.cmp

**Signature:** `api.cmp( "./my/module", [ arg1, arg2 ] )`

This method is loading selected module with support for [common module pattern](#using-common-module-pattern). Optionally provided arguments are passed in addition to options on invoking function exposed by selected module as part of common module pattern. 

If selected module doesn't comply with that pattern it is loaded as usual.

### api.config <Badge type="info" text="0.3.0"></Badge>

All configuration of every available plugin as well as the application itself is [loaded from Javascript files in either ones' **config** sub-folder](../internals/bootstrap.md#configuration) and merged into a single configuration object which is exposed here.

#### api.config.$appConfig

Configuration provided in `api.config` always includes options exported by available plugins. If you need to access the application's own configuration - which is merged from reading all Javascript files in application's sub-folder **config** - this basically hidden property can be used.

This is the application's counterpart to either plugin's [exposure of its pure configuration](plugins.md#plugin-config).

### api.crash() <Badge type="info" text="0.5.0"></Badge>

**Signature:** `api.crash( Error ) : Promise`

Using this function an application may _crash_ itself by intention. The provided error is logged before shutting down application and its request listener.

This function may be useful when running a Hitchy application in a container. Consider your application has entered some failed state it might want to recover from the easy way by simply restarting on purpose. This is possible by invoking this function.

This function is different from [api.shutdown()](#api-shutdown) by writing provided error to log file and exit process with non-zero status code eventually. The returned promise is always rejected with the provided error. In addition, when called before promise returned from [api.shutdown()](#api-shutdown) is settled, that promise will be rejected as well.

### api.data

Hitchy's API gets sealed after bootstrap has finished to prevent intended or accidental change of any exposed API. 

This property is excluded in particular to provide a common space multiple components can use for saving and sharing data that's exceeding the lifetime of a single request.

### api.folder

This function takes a relative path name of a file or folder and qualifies it in context of current hitchy-based project, which is your application.

The provided relative path name may start with special markers to select one of several supported base folders:

* `@project/some/file.ext` is selecting **some/file.ext** in context of your current project's folder. This is the default behaviour when providing just `some/file.ext`, too.
* `@hitchy/some/file.ext` is selecting **some/file.ext** in context of [folder containing currently used core implementation of Hitchy](#optionshitchyfolder). Usually, this folder is located in **node_modules/hitchy** of your project's folder, but using command line arguments it is possible to pick a different location. 

### api.log()

This function is a generator for logging facilities. It is invoked with the name of a logging facility and returns another function which can be used to actually generate log messages on behalf of either facility.

:::tip Example
```javascript
const AlertLog = api.log( "hitchy:plugin:tooling:alert" );
const DebugLog = api.log( "hitchy:plugin:tooling:debug" );

DebugLog( "got some configuration" );

AlertLog( "connection lost" );
```
:::

Basically, facilities are supported to cluster your application's log and help with controlling what messages are actually logged or not making it more useful in either situation.

:::tip Environment-Based Control
Environment variable **DEBUG** is examined for providing a comma-separated list of facilities to be enabled. 

```bash
DEBUG=hitchy:*,myapp:*,-*
```

Every item of that list 

* is a facility name to be logged,
* may be prefixed with single dash `-` to explicitly exclude a matching facility from logging,
* may contain asterisk `*` for matching multiple facilities to be enabled or disabled.
:::

:::warning Naming Convention
Facility names should represent a hierarchy of facilities by extending the name of a superordinated facility with a colon and the intended facility's name. 

Sticking to this pattern is beneficial on using asterisk `*` in logging control.
::: 

### api.meta <Badge type="info" text="0.4.0"></Badge>

This property is exposing application's meta information which is similar [meta information](plugins.md#meta-information) attached to every plugin. In both cases meta information can be considered another set of configuration. It can be distinguished, though, for

* it is available very early in Hitchy's [bootstrap process](../internals/bootstrap.md) and thus capable of customizing its [early stages](../internals/architecture-basics.md#discovering-plugins).

  Meta information becomes available at the beginning of [second stage discovering plugins](../internals/bootstrap.md#discovery). That's why it is already available in processing [exposure stage](../internals/bootstrap.md#exposure) preceding [configuration stage](../internals/bootstrap.md#configuration) since version 0.4.0.

* it is meant to control more technical aspects of processing a plugin or the application without supporting different behaviour per installation of same plugin or application.

  Controlling the [order of plugin processing](plugins.md#dependencies) or the way of [deriving component names from their implementing files' names](plugins.md#appendfolders) isn't meant to be customized per installation.

* it isn't polluting configuration object which is intended for more frequent use at runtime.

Application's meta information is read from two probable sources and merged into single set of data exposed here.

1. An application may have its own **hitchy.json** file in its root folder.

   :::tip Example
   Assume to have a file named **hitchy.json** with following content:
   ```json
   {
       "appendFolders": false
   }
   ```
   :::

2. In addition its **package.json** file may provide meta information in special property **hitchy**.

   :::tip Example
   The same information given in example above could be provided via application's **package.json** file like this:
   
   ```json
   {
       "name": "my-app",
       "version": "1.0.0",
       ...
       "hitchy": {
           "appendFolders": false
       }
   }
   ```
   :::

Data found in **hitchy.json** file is preferred over data found in **package.json**. Most [meta information elements supported for plugins](plugins.md#meta-information) are ignored in context of application except for these:

* [`deepComponents`](plugins.md#deepcomponents)
* [`appendFolders`](plugins.md#appendfolders)

### api.plugins

All discovered and loaded plugins are listed in this property. It is an object mapping a [plugin's role](plugins.md#roles) (which might be different from its name!) into either [plugin's API](plugins.md#common-plugin-api). 

### api.runtime

This section of Hitchy's API is exposing a compilation of all components exposed by discovered plugins as well as current application itself. They are grouped by component type.

* Controllers are exposed in `api.runtime.controllers`.
* Policies are exposed in `api.runtime.policies`.
* Models are exposed in `api.runtime.models`.
* Services are exposed in `api.runtime.services`.

For the sake of flexibility and fault tolerance either group is exposed using its singular name as well. Thus using `api.runtime.controller` is equivalent to using `api.runtime.controllers` etc.

:::warning Change of API
Starting with version 0.3.0 the configuration isn't available as `api.runtime.config` anymore, but exposed as [`api.config`](#api-config).
:::

### api.shutdown() <Badge type="info" text="0.5.0"></Badge>

**Signature:** `api.shutdown() : Promise`

Application may intentionally shut down itself by invoking this function. It is returning a promise which is controlled by events emitted on API. This promise is

* fulfilled on next [close](#close) event and
* rejected on next [error](#error) event.

### api.utility.case

This subsection provides functions for converting between different practices for writing names.

* kebab-case to PascalCase:
  ```javascript
  pascal = api.utility.case.kebabToPascal( "kebab-case" );
  ```

* kebab-case to camelCase:
  ```javascript
  camel = api.utility.case.kebabToCamel( "kebab-case" );
  ```

* PascalCase to kebab-case:
  ```javascript
  kebab = api.utility.case.pascalToKebab( "PascalCase" );
  ```

* camelCase to kebab-case:
  ```javascript
  kebab = api.utility.case.camelToKebab( "camelCase" );
  ```

* camelCase to PascalCase:
  ```javascript
  pascal = api.utility.case.camelToPascal( "camelCase" );
  ```

### api.utility.file

This subsection provides helper functions used by Hitchy for accessing local file system.

:::warning Deprecation Warning
There is a more powerful package [file-essentials](https://www.npmjs.com/package/file-essentials) and we consider to replace these functions with that package in a future release.
:::

### api.utility.object

This subsection provides helper functions for 

* deeply merging objects:
  ```javascript
  target = api.utility.object.merge( target, sourceA, sourceB, ... )
  ```

* deeply sealing objects:
  ```javascript
  object = api.utility.object.seal( object )
  ```

  A callback may be provided in second argument to be called on every object to be sealed. It is invoked with breadcrumb of property names as array of strings and assumed to return boolean indicating whether either object should be actually sealed or not.

* deeply freezing objects:
  ```javascript
  object = api.utility.object.freeze( object )
  ```

  A callback may be provided in second argument to be called on every object to be frozen. It is invoked with breadcrumb of property names as array of strings and assumed to return boolean indicating whether either object should be actually frozen or not.

### api.utility.promise

This subsection is passing API of module `promise-essentials` Hitchy is relying on to manage more complex asynchronous processes. It is exposed here for use in plugins and applications to prevent multiple dependencies on that module in a single resulting application.


## Request Context

On request handling routes are used to select handlers to be invoked. Those handlers areare functions invoked with `this` referring to a _request context_ which is providing information related to currently dispatched request.

:::tip
In a request handler like

```javascript
function( req, res ) {
    // TODO add some handling code here
}
```

the _request context_ is available using `this`.
:::

### this.api

[Hitchy's API](#api-elements) is provided in request context for simplified access.

### this.config <Badge type="info" text="0.3.0"></Badge>

This property is an alias for simplified access on [`api.config`](#api-config) of Hitchy's API exposing current runtime configuration.

### this.consumed

This property contains markers used internally to handle cases that haven't been handled by any controller. You shouldn't use or adjust those marks.

### this.context <Badge type="info" text="0.3.0"></Badge>

This property is a string naming the service hitchy is integrated with. Currently supported values are:

* `standalone` when running current application without any integration into some other application.
* `express` when running current application with Hitchy integrated into an Express-based application.

### this.controllers <Badge type="info" text="0.3.0"></Badge>

This is another alias for simplifying access on collection of available controllers.

:::tip
Using `this.controller` is supported as well.
:::

### this.done()

This callback is provided by the service Hitchy is integrating with. When using Hitchy with [Express](https://expressjs.com/) invoking this function is starting next handler function registered with Express skipping any code that's authoritative in scope of Hitchy integrating with Express.

:::tip Caution
Don't use this function for it might be causing significant side effects.
:::

### this.local

This object is provided for sharing volatile information between handlers involved in handling a particular request. This information is shared between policies and controllers participating in handling a request and gets dropped when handling request has finished.

### this.models <Badge type="info" text="0.3.0"></Badge>

This alias is simplifying access on collection of available models.

:::tip
Using `this.model` is supported as well.
:::

### this.policies <Badge type="info" text="0.3.0"></Badge>

This alias is simplifying access on collection of available policies.

:::tip
Using `this.policy` is supported as well.
:::

### this.request

This property is a reference on [IncomingMessage](https://nodejs.org/dist/latest/docs/api/http.html#http_class_http_incomingmessage) describing current request to be handled. It is identical to the reference provided in first argument usually named `req` of either handler.

### this.response

This property is a reference on [ServerResponse](https://nodejs.org/dist/latest/docs/api/http.html#http_class_http_serverresponse) for managing response to be sent. It is identical to the reference provided in second argument usually named `res` of either handler.

### this.runtime

This property is an alias for simplified access on [`api.runtime`](#api-runtime) of Hitchy's API exposing available components.

### this.services <Badge type="info" text="0.3.0"></Badge>

This alias is simplifying access on collection of available services.

:::tip
Using `this.service` is supported as well.
:::

### this.startTime

This property is exposing the time of handling current request has started as number of milliseconds since midnight of January 1st, 1970.


## Request Helpers

In request handlers of [controllers](../internals/components.md#controllers) and [policies](../internals/components.md#policies) there are two provided arguments usually named `req` and `res`. The former is basically an [IncomingMessage](https://nodejs.org/dist/latest/docs/api/http.html#http_class_http_incomingmessage) and the latter is a [ServerResponse](https://nodejs.org/dist/latest/docs/api/http.html#http_class_http_serverresponse). But either object is extended to provide additional information and functionality.

:::warning Standalone vs. Integrated With ExpressJS
Most helpers described here are basically available in a standalone Hitchy application. When using [Hitchy integrated with ExpressJS](../internals/architecture-basics.md#integrating-with-services) most of these helpers are provided by ExpressJS and thus may behave differently.
:::

:::tip
In a request handler like

```javascript
function( req, res ) {
    // TODO add some handling code here
}
```

the _request helpers_ are available as part of object provided as `req`.
:::

### req.accept

A properly sorted list of MIME type ranges is provided in this property according to any current request's [Accept](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept) header field. There is always a list of MIME ranges and either item is provided without optional parameters.

:::tip Example
When handling request with header `Accept: text/*;q=0.5, text/json` this property will expose sorted list of given MIME ranges `[ "text/json", "text/*" ]`.
:::

### req.api <Badge type="info" text="0.5.3"></Badge>

This property is virtually aliasing [req.hitchy](#req-hitchy) to support framework-agnostic code.

### req.context

This property is exposing the [request context](#request-context) which is also available via `this` in an invoked request handler. However, due to binding to different contexts use of `this` might not be an option.

### req.cookies

:::warning Requires Plugin
This property requires installation of plugin [hitchy-plugin-cookies](https://www.npmjs.com/package/hitchy-plugin-cookies) as a dependency of your project.
:::

This property exposes object containing all cookies transmitted by client in current request.

### req.fetchBody( parser )

This method promises request's body. The optional parameter can be used to control parser used for extracting contained information.

:::warning
When integrating with ExpressJS it might have fetched and parsed request body before exposing it as `req.body`. In this case Hitchy isn't capable of accessing raw request body anymore. This is limiting use of this function.

Supporting this scenario any existing data in `req.body` will be delivered whenever using this function for _fetching_ request's body without regards to some optionally selected parser. 
:::
 
* When omitted or set `null` any parser function in configuration is used to commonly parse raw body for contained information. When there is no configured parser some fallback is used supporting JSON and form-encoded request bodies.

* On providing function here this one is used to parse the raw body instead of any configured or fallback parser.

* On providing `false` the raw body is promised as instance of Buffer. This is bypassing any parser to be invoked thus won't result in caching some parser's output as well.

:::tip Different Parsers and Body Caching
This method is caching any previously extracted body data in association with provided parser argument. Thus, re-invoking this method with a different parser results in parsing raw body again while providing same parser re-fetches same information as before.

When providing custom function make sure to provide the same instance of that function to benefit from this caching. As an option assign a global body parser function in configuration as `config.bodyParser`.
:::

### req.hitchy <Badge type="info" text="0.2.0"></Badge>

This property is exposing [Hitchy's API](#hitchys-api). It has been named `hitchy` instead of a more common `api` to prevent it from interfering with other framework's API in portable code meant to run with different frameworks.

:::tip Virtual Alias <Badge type="info" text="0.5.3"></Badge> 
There is a virtual alias _additionally_ exposing Hitchy's API as `req.api` unless this property exists in request descriptor. This is useful for writing code agnostic to supported frameworks.
:::

### req.is() <Badge type="info" text="0.5.3"></Badge>

When discovering format of some provided request body data this function may be used to conveniently check the client-provided information in request header `content-type`. 

The function takes one or more patterns matching expected formats and the first one matching current request will be returned. If neither listed pattern is matching, `false` is returned.

```javascript
// if request claims to provide application/json
req.is( "application/json" ); // --> "application/json"
req.is( "json" );             // --> "json"
req.is( "*/json" );           // --> "*/json"
req.is( "json", "*/json" );   // --> "*/json"
req.is( "text", "json" );     // --> "json"
req.is( "text" );             // --> false
```

On all requests lacking any body data `null` is returned:

```javascript
// if request doesn't seem to provide any octet of body data
req.is( "application/json" ); // --> null
req.is( "json" );             // --> null
req.is( "*/json" );           // --> null
req.is( "json", "*/json" );   // --> null
req.is( "text", "json" );     // --> null
req.is( "text" );             // --> null
```

If there is some body data but request header `content-type` is missing, this function is returning false:

```javascript
// there is body data, but "content-type" is missing
req.is( "application/json" ); // --> false
req.is( "json" );             // --> false
req.is( "*/json" );           // --> false
req.is( "json", "*/json" );   // --> false
req.is( "text", "json" );     // --> false
req.is( "text" );             // --> false
```

Supported test patterns are mostly equivalent to the ones supported by [type-is](https://github.com/jshttp/type-is) which is used in [express](https://expressjs.com/en/4x/api.html#req.is). However, this implementation _might_ differ from that one in some aspects:

* All string-based tests work case-insensitively.

  ```javascript
  // if request header contains `content-type` with `AppliCatIon/JsON`
  req.is( "json" );                           // --> "json"
  req.is( "application/json" );               // --> "application/json"
  ```
  
  On matching, the provided pattern is returned as-is, though.

  ```javascript
  // if request header contains `content-type` with `AppliCatIon/JsON`
  req.is( "JSON" );                           // --> "JSON"
  req.is( "aPPLicATion/JSOn" );               // --> "aPPLicATion/JSOn"
  ```

* When providing patterns without forward slash like `png` or `html` instead of `image/png` or `text/html` this library simply requires that pattern to match either first or second part of found MIME information.

  ```javascript
  // if request header contains `content-type` with `text/html`
  req.is( "html" );                           // --> "html"
  // if request header contains `content-type` with `image/png`
  req.is( "image" );                          // --> "image"
  req.is( "png" );                            // --> "png"
  ```

* Some special cases differ from that first rule for being replaced with a different pattern internally.

  | provided     | actually tested                |
  |--------------|--------------------------------|
  | `text`       | `text/plain`                   |
  | `multipart`  | `multipart/*`                  |
  | `urlencoded` | `application/x-www-urlencoded` |
  | `+json`      | `*/*+json`                     |
  | `+xml`       | `*/*+xml`                      |

  Just like in [type-is](https://github.com/jshttp/type-is) the last qualification examples apply to any provided string starting with `+`.

* All patterns can contain `*` for basically matching any number of characters. It may appear multiple times and in any position of your pattern. However, neither case is matching the forward slash for being applied on separated halves of MIME information.

  ```javascript
  // if request header contains `content-type` with `text/html`
  req.is( "text", "te*tml", "t*e*x*t" );      // --> "t*e*x*t"
  ``` 

* You may provide regular expressions instead of strings. Those are applied to the full content of `content-type` header. On match the actual MIME information found in request header without optional qualifiers such as `;charset=UTF-8` is returned.

  ```javascript
  // if request header contains `content-type` with `application/json; charset=UTF-8`
  req.is( /*\/json\b/ );      // --> "application/json"
  ``` 

### req.params

This object is populated with named segments of currently dispatched route. 

:::tip Example
If your handler is bound to handle a route like `GET /api/:model/:item` and client was requesting `/api/user/123` then `req.params` looks like this:

```json
{
    model: "user",
    item: "123"
}
```
:::

### req.path

This property conveniently provides current request's path which is the requested URL without any appended query string or hash.

:::tip Example
On requesting `/some/path/name?with=arg` this property will provide `/some/path/name`.
:::

### req.query

This property is an object exposing all query parameters.

:::tip Example
On requesting `/some/path/name?with=arg&another=one` this property will provide the following object:

```json
{
    with: "arg",
    another:  "one"
}
```
:::

### req.session

:::warning Requires Plugin
This property requires installation of plugin [hitchy-plugin-session](https://www.npmjs.com/package/hitchy-plugin-session) as a dependency of your project.
:::

This object consists of two properties meant to provide server-side session shared by different requests transmitted from same client.

* In `req.session.user` currently authenticated user is stored.

  :::warning
  This feature needs installation of another plugin, e.g. [hitchy-plugin-auth](https://www.npmjs.com/package/hitchy-plugin-auth).
  :::
  
* `req.session.data` can be used in your controllers and policies to store arbitrary information regarding currently requesting client. 

  Make sure any stored information can be serialized, thus you shouldn't put instances of some custom class in here, but use native data suitable for converting to/from JSON, only.

:::tip Supported Scenarios
Sessions rely on client passing session cookie in every request following some initial one. Usually this is available with browsers requesting pages and assets on behalf of a user. You should not rely on this session feature when it comes to REST APIs, though.
:::


## Response Helpers

In handling requests there is a response manager provided in second argument usually named `res`. Basically this is an instance of [ServerResponse](https://nodejs.org/dist/latest/docs/api/http.html#http_class_http_serverresponse). But Hitchy is injecting some additional methods for simplifying generation of responses. 

:::tip Fluent Interface
Those _additional methods_ listed below are providing fluent interface for chaining multiple invocations.

```javascript
res.status( 400 ).set( "content-type", "text/json" ).send( { ... } );
```

However, signatures of methods natively provided as part of [ServerResponse](https://nodejs.org/dist/latest/docs/api/http.html#http_class_http_serverresponse) aren't adjusted.
:::

:::tip Preventing Response on HEAD Requests <Badge type="info" text="0.2.2"></Badge>
Requests using HTTP method HEAD must not provide a response. Disobeying this usually results in exceptions thrown e.g. on trying to send some JSON-formatted response.

Hitchy is designed to detect any such request limiting capabilities of response manager's methods related to describing some actual content. That's why you don't need to take care of omitting response content in handlers supported HEAD requests as well.
:::

:::warning Standalone vs. Integrated With ExpressJS
Most helpers described here are basically available in a standalone Hitchy application. When using [Hitchy integrated with ExpressJS](../internals/architecture-basics.md#integrating-with-services) most of these helpers are provided by ExpressJS and thus may behave differently.
:::

:::tip
In a request handler like

```javascript
function( req, res ) {
    // TODO add some handling code here
}
```

the _response helpers_ are available as part of object provided as `res`.
:::


### res.format( handlers )

This method provides different handlers for generating response with each handler bound to one particular type or format of response data. According to current request's [Accept](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept) header the best matching handler is picked to eventually create a response.

A special handler named `default` is used if neither provided handler is matching any type of response accepted in current request. If this default handler is missing a `406 Not Acceptable` is issued implicitly in that case.

Handlers' names are either MIME types or some supported filename extensions considered aliases for related MIME type.

:::tip Example
Using this function in a request handler

```javascript
res.format( {
    html( req, res ) {
        res.send( "<html>...</html>" );
    },
    "text/json"( req, res ) {
        res.json( { some: "data" } );
    },
    default( req, res ) {
        res.status(400).send( "unsupported type of response" );
    }
} )
```

the response is provided as JSON when requesting with `Accept: text/json` and as an HTML document when requesting with `Accept: text/html`.
:::

### res.json( data )

This method generates a JSON-formatted response and sends it to the client. It is ending current response implicitly.

:::tip Example
```javascript
res.json( { some: "data" } );
```
:::

### res.redirect( statusCode, url )

Use this helper to instantly generate and send response requesting user to fetch different URL for some desired information.

:::tip Example
```javascript
res.redirect( 301, "https://example.com/" );
```
:::

### res.send( content )

This method is sending provided content to the client implicitly ending response to current request. The response's type of content depends on type of value provided as `content` here:

* Providing an object the response is JSON-formatted.

* When providing a string the response is sent as plain text unless having set some different `content-type` header before. 

* When providing an instance of Buffer or any other kind of data the response is an octet stream with MIME type `application/octet-stream`.

:::tip Example
```javascript
res.send( { some: "data" } );
```

```javascript
res.send( Buffer.from( "..." ) );
```
:::

### res.set( name, value )

Adjusts single field of response header. Internally this function is invoking `res.setHeader()`.

:::tip Example
```javascript
res.set( "content-type", "text/json;charset=utf8" );
```

```javascript
res.set( "x-api-level", "3" );
```
:::

### res.set( fields )

Adjusts multiple fields of response header at once. Internally this function is invoking `res.setHeader()` for every listed header field.

:::tip Example
```javascript
res.set( {
    "content-type": "text/json;charset=utf8",
    "x-api-level": "3"
} );
```
:::

### res.status( code )

Adjusts HTTP response status code.

:::tip Example
```javascript
res.status( 404 ).json( { error: "no such data" } )
```
:::

### res.type( mime )

Adjusts `content-type` header field of response supporting several aliases for simplified selection of response type.

:::tip Example
```javascript
res.type( "json" ).send( JSON.stringify( true ) )
```

```javascript
res.type( "image/png" ).send( bufferContainingPNG )
```
:::
