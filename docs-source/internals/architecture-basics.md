# Architecture Basics

This document is introducing basic designs in Hitchy framework and how parts of code interact with each other the create a running application.

## The Core

Hitchy consists of a very rudimentary core that's basically capable of these features:

* integrating with some service, usually an HTTP service
* discovering plugins
* routing incoming requests through handlers resulting in a response

## Integrating With Services

Currently there are two _injectors_: one is available for integrating a Hitchy-based application with an Express.js based service as a middleware. A second one is attaching a Hitchy-based application with a purely Node.js based HTTP service. 

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

1. The first stage is called _triangulation_ and it is used to derive runtime options from current context unless given explicitly on start, e.g. detecting project folder to use.

2. The _discovery_ stage is used to search folders of a project for [plugins](#plugins) suitable for integrating with Hitchy. This results in a sequence of discovered plugins sorted in order of plugins relying on each other. Plugins depending on other plugins are listed late in this sequence.

3. In _configuration_ stage every plugin is asked for its contribution to application's configuration. This includes processing the custom configuration provided as part of the current application itself as well.

4. _Exposure_ stage is loading [components](#components) provided by either plugin for exposing them in context of a resulting, commonly available [Hitchy API](../api).

5. The _initialisation_ stage is used to let every plugin initialise its state.

6. Eventually a _routing_ stage is passed for compiling routing definitions into  optimized routing tables.

Eventually bootstrap process is finished by _preparing_ application for graceful shutdown which is going to request every plugin for shutting down prior to leaving application process when requested.

### Plugins

In context of a Hitchy-based application a plugin is meant to introduce new features to simplify development of any such application. Plugins usually consist of files distributed as npm packages. They need to comply with some specific conventions to be discovered as plugins and to be properly integrated with the bootstrap process described before.

:::tip
A commonly used alias is _extension_ but starting with Hitchy 0.2.0 terminology has been revised. The term plugin is preferred since then for official plugin packages using names starting with **hitchy-plugin-...**.
:::

### Components

Every plugin as well as your application is meant to use four kinds of building blocks:

* controllers
* policies
* models
* services

Those four kinds of blocks are commonly referred to as _components_ of a Hitchy-based application. There is [a separate chapter describing them in more detail](components.md).

### Modules

Starting with v0.2.0 of Hitchy its understandig of a _module_ isn't any different from Node.js anymore. A Javascript file exporting some API is a module that can be loaded.
