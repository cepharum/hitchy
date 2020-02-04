# Architecture Basics

This document is introducing basic designs in Hitchy framework and how parts of code interact with each other the create a running application.

## The Core

Hitchy consists of a very rudimentary core that's basically capable of these features:

* [integrating with some service](#integrating-with-services), usually an HTTP service
* [discovering and loading plugins](#discovering-plugins)
* [routing incoming requests](routing-basics.md) through handlers resulting in a response

## Integrating With Services

Currently there are two _injectors_: one is available for integrating a Hitchy-based application with an Express.js based service as a middleware. A second one is attaching a Hitchy-based application to a purely Node.js based HTTP service. 

Integrating with ExpressJS application is as simple as this:

```javascript
const Hitchy = require( "hitchy" ).express;
const MyApp = Hitchy( {
    projectFolder: "path/name/of/hitchy/project",
} );

expressApp.use( "/some/prefix", MyApp );
```

In opposition to that, any Hitchy-based application can be invoked standalone using control script which is included with Hitchy:

```bash
hitchy start --project path/name/of/hitchy/project
``` 

## Discovering Plugins

Plugins are discovered when starting Hitchy. There is bootstrap code which is passing these stages:

1. The first stage is called **triangulation** and it is used to derive runtime options from current context unless given explicitly on start, e.g. detecting application's project folder to use.

2. The **discovery** stage is used to search folders of a project for [plugins](#plugins) suitable for integrating with Hitchy-based application. This results in a sequence of discovered plugins sorted in order of plugins relying on each other. Plugins depending on other plugins are listed late in this sequence.

3. **Exposure** stage is loading [components](#components) provided by either plugin as well as the application for exposing them in context of a resulting, commonly available [Hitchy API](../api).

   :::warning Compatibility
   In versions before 0.4.0 exposure stage was processed after configuration stage. Order has been swapped to support services in configuration. 
   :::

4. In **configuration** stage every plugin is asked for its contribution to application's configuration. This includes processing the custom configuration provided as part of the current application itself as well.

5. The **initialisation** stage is used to let every plugin initialise its state.

6. Eventually a **routing** stage is passed for compiling routing definitions into optimized routing tables.

Stages 3 to 6 are always processing plugins in order resulting from discovery stage. 

This bootstrap process is finished by _preparing_ application for graceful **shutdown** stage which is going to request every plugin in reverse order for shutting down prior to leaving application process when requested.

:::tip Additional Information?
See the [very detailed description of bootstrap process](./bootstrap.md) for more details.

Read about [Hitchy's Plugin API](../api/plugins.md) to learn how to write your own plugin.
:::

## Building Blocks

### Plugins

In context of a Hitchy-based application a plugin is meant to introduce new features to simplify development of any such application. Plugins usually consist of files distributed as npm packages. They need to comply with some specific conventions to be discovered as plugins and to be properly integrated with the bootstrap process described before.

:::tip
A commonly used alias is _extension_ but starting with Hitchy 0.2.0 terminology has been revised. The term _plugin_ is preferred since then for official plugin packages using names starting with **hitchy-plugin-...**.
:::

### Components

Every plugin as well as your application is meant to use four kinds of building blocks:

* controllers
* policies
* models
* services

Those four kinds of blocks are commonly referred to as _components_ of a Hitchy-based application. There is [a separate chapter describing them in more detail](components.md).

### Modules

Starting with v0.2.0 of Hitchy its understandig of a _module_ isn't any different from Node.js anymore. A Javascript file exporting some API is a module that can be loaded e.g. by using `require()`. 

In previous versions the term module was used for what is now called a [plugin](#plugins).
