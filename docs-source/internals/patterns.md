# Patterns

Hitchy strongly relies on conventions over configuration paradigm. As such, there are some patterns introduced below that you might want to comply with to benefit from Hitchy's capabilities the most.


## Common Module Pattern

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

In addition to those modules, Hitchy's core supports so called _common module pattern_ (CMP) when _discovering_ plugins and their components.

:::warning Discovering Plugins?
In Hitchy _discovering_ a plugin is different from _requiring_ it. The term discovery refers to Hitchy's capability of [automatically loading a plugin during bootstrap](architecture-basics.md#discovering-plugins). In opposition to that, any code of your application may still `require()` modules the usual way. **However, this is going to have some negative side effects for modules relying on _common module pattern_**. That's why we suggest to stick with this pattern most of the time. 
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

### Returning Promise

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

### Passing Additional Information

Whenever Hitchy is supporting common module pattern it might intend to pass further information in addition to its API and options. This information will be provided as additional arguments following provided options.


## Common Module Function Pattern

A similar pattern is named _common module function pattern_ (CMFP). It is supported mostly for implementing Hitchy plugins e.g. when exposing [a plugin's integration with Hitchy's plugins API](plugins.md#common-plugin-api). 

Just like [common module pattern](#common-module-pattern) it is meant to support provision of a function to be invoked for generating some data instead of providing that data immediately. Again, any such function is invoked with Hitchy's API provided as `this`, Hitchy's options in first argument and any number of additional data provided in further arguments.

In opposition to [common module pattern](#common-module-pattern) this one isn't about a whole module's export to be generated dynamically but some property or method exported there.


### Use Cases

When implementing a Hitchy-based application complying with [common module pattern](#common-module-pattern) is superior over adopting [common module function pattern](#common-module-function-pattern). For example, when creating a service component most parts of Hitchy's API are available when [loading the component in exposure stage](bootstrap.md#exposure). Thus sticking with common module pattern is suggested for implementing components like [controllers](components.md#controllers) and [services](components.md#services) as well as more dynamic configuration files.

However, when _implementing a plugin for Hitchy_ instead of an application with Hitchy, that plugin's main file is [exposing elements of plugins API](../api/plugins.md#common-plugin-api) to be retrieved at different stages of bootstrapping an application your plugin will be used with. In that case using common module function pattern is superior for either exported element is gaining access to a different amount of Hitchy's API whereas using common module pattern will have early access to a very limited API of Hitchy, only.

Let's consider this rather simple example of a plugin declaring blueprint routes:

**node_modules/your_plugin/index.js**
```javascript
module.exports = {
    blueprints: {
        "/": "foo.index()",
        "/bar": "foo.bar()",
    },
};
```

If you need to collect some information first to have a context-aware set of routes exported, you might want to stick with common module pattern:

**node_modules/your_plugin/index.js**
```javascript
module.exports = function( options ) {
    const api = this;
    const blueprints = {};

    // TODO collect routing definitions in blueprints variable

    return {
        blueprints,
    };
};
```

Using `api` for dynamically creating values of exposed `blueprints` property would fail most probably for this code is run at [discovery stage of bootstrap](bootstrap.md#discovery) when your plugin's module is loaded for the first time. At that point in time there is no access on eventually available plugins, there is no configuration and there are no components ready for use. It might even happen that your plugin won't make it into the application, finally.

According to plugins API, the [`blueprints` property](../api/plugins.md#plugin-blueprints) is assumed to be a regular object or some map, by default. By adopting common module function pattern it becomes a function, though:

**node_modules/your_plugin/index.js**
```javascript
module.exports = {
    blueprints( options ) {
        const api = this;
        const blueprints = {};

        // TODO collect routing definitions in blueprints variable

        return {
            blueprints,
        }; 
    },
};
```

Here, the module still gets loaded early in bootstrapping application. But routing definitions aren't collected quite as early, but when Hitchy is in [routing stage](bootstrap.md#routing) which is close to the end of bootstrapping with all plugins, models, services, controllers and configurations being exposed in `api`.

On top of that, you may even return a promise for the eventually used routing definitions, again:

**node_modules/your_plugin/index.js**
```javascript
module.exports = {
    blueprints( options ) {
        const api = this;

        return someAsynchronousCode()
            .then( info => {
                const blueprints = {};

                // TODO collect routing definitions in blueprints variable
            	
                return {
                    blueprints,
                };
            } );
    },
};
```
