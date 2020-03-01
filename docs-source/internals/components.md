# Components

A Hitchy-based application relies on components to be exposed by the application as well as any available plugin. During [bootstrap](bootstrap.md) Hitchy is [searching for Javascript files implementing components](bootstrap.md#collecting-deriving-replacing) in certain folders of every plugin as well as the application.

:::tip
Those folders are mentioned below in context of either type of component. 
:::

When loading a component's file it is assumed to export the component's API. This might be some class or some object providing its methods.

Every component is exposed at runtime using a name for either component which is [derived from its file's relative path name](#derivation-of-component-names). When multiple files in installed plugins and your application result in same name of component only the last one read will be exposed. However either file is loaded with a reference to the existing component it is replacing.


## Kinds of Components

Hitchy knows four different kinds of components described below. Either kind of component is assumed to be implemented as a [CommonJS module as supported by Node.js](https://nodejs.org/dist/latest/docs/api/modules.html#modules_modules) currently.

### Controllers

A controller is a module or class that is exposing methods for eventually handling requests and sending some response. Controllers are discovered in folder **api/controllers** of your application as well as any installed plugin.

**config/routes.js**
```javascript
exports.routes = {
    "/my/route": "GreetingsController.sayHey"
};
```

**api/controllers/greetings.js**
```javascript
module.exports = {
    sayHey( req, res ) {
        res.send( "Hey!" );
    }
};
```

:::warning About Discovery
Talking about the discovery of controllers doesn't imply to have some routes defined for linking either controller's handlers with requests they are meant to handle. Any routing configuration as provided in first example above must be defined manually.
:::

### Policies

A policy is a module or class just like a [controller](#controllers). However, it is meant to handle requests collaboratively with other policies and some final controller. Thus it might ignore requests or adjust request information without ever responding to any request. Multiple policies may be involved in processing a single request. That's why policies are capable of passing control to next available policy in chain of processing policies which isn't possible for a controller.

Policies are always able to send a response nonetheless. That's useful for implementing filters next to controllers.

A final difference between controllers and policies regards the way they are picked to be involved in processing a particular request. Policies are applied to requests sharing prefix of URL path. A controller is obeyed when fully matching a request's URL path.

:::tip Example
Consider a client is requesting URL `/api/user/search?name=John`. 

This request would pick controller routes matching `/api/user/search` as a whole, only. 

In opposition to that, any policy route matching `/`, `/api`, `/api/user` or `/api/user/search` would be picked up for processing in order from shortest to longest matching prefix.
:::

Policy components are discovered in folder **api/policies** of your application as well as any installed plugin.

**config/routes.js**
```javascript
exports.policies = {
    "/": "BodyPolicy.accessGranted"
};
```

**api/policies/body.js**
```javascript
module.exports = {
    accessGranted( req, res, next ) {
        if ( req.query.token === "secret" ) {
            req.accessGranted = true;
            res.set( "x-granted", "1" );
            next();
        } else {
            res.status( 403 ).json( { error: "access forbidden" } );
        }
    }
};
```

:::tip Remarks
The preceding example illustrates support for callback provided in third argument for calling next policy in chain of policies to be applied. **In fact, any policy hast to invoke this callback unless it is returning a promise instead.**

The example also illustrates a policy adjusting response without responding by [setting response header](../api/README.md#res-set-name-value). 

Eventually it shows a _filter_ instantly responding to client in case of an error. In the latter case make sure the response is finished.
:::


### Models

Models are modules or classes describing data to be managed by your application. They are meant to be an interface for accessing data in an attached data storage like a database.

:::warning
Hitchy doesn't know much about handling data itself. However, there is a pretty powerful [plugin](https://www.npmjs.com/package/hitchy-plugin-odem) you definitely want to check out.
:::

They are discovered in folder **api/models** of your application as well as any installed plugin.


### Services

Services are modules or classes as well. They are meant to implement and provide features that are commonly required in controllers, policies and models. Whenever there is code to be used redundantly you should put it in a service.

Service components are discovered in folder **api/services** of your application as well as any installed plugin.


## Exposure At Runtime

All components are exposed at runtime in section `runtime` of [Hitchy's API](../api/README.md#api-runtime). There are separate groups for every kind of component:

* `api.runtime.controllers` 
* `api.runtime.policies` 
* `api.runtime.models` 
* `api.runtime.services`

In addition, in [context of a controller's or a policy's request handler](../api/README.md#request-context) either collection of components is available via some convenient alias:

* `this.controllers`
* `this.policies`
* `this.models`
* `this.services`

:::tip Singular Collection Names
For the sake of convenience and integrity either collection can be addressed using singular names as well.
:::

### Derivation of Component Names

When exposing components Hitchy is deriving either component's resulting name from path name of Javascript file providing its implementation relative to the type of component's folder following this process:

1. The file's extension **.js** is dropped.
2. Leading digits optionally separated by a dash or underscore are stripped off.

   Leading digits can be used to optionally control the order of loading available modules during bootstrap e.g. to assure that some component is capable of accessing its previously loaded parent class.
3. The segments of path name 
   * [are reversed](#customizing-exposure) and
   * joined by dashes instead of slashes.
4. The resulting name 
   * is converted to all lowercase letters and eventually 
   * converted from kebab-case naming style into PascalCase naming style.

:::tip Example
Consider having a file **api/services/01-converter-tool/archive/1_ZIP.js**. This would result in the following value per step given before:

1. **01-converter-tool/archive/1_ZIP**
2. **converter-tool/archive/ZIP**
3. 
   * **ZIP/archive/converter-tool**
   * **ZIP-archive-converter-tool**
4.
   * **zip-archive-converter-tool**
   * **ZipArchiveConverterTool**

Thus the component implemented in assumed file would be exposed as `api.runtime.services.ZipArchiveConverterTool`.
:::


### Customizing Exposure

Starting with version 0.3.3 every plugin as well as the application may customize the way Hitchy is discovering and exposing their individual components.

* A plugin may use options [`deepComponents`](../api/plugins.md#deepcomponents) and [`appendFolder`](../api/plugins.md#appendfolders) of its [meta information](../api/plugins.md#meta-information).

* The application can provide the same options as part of [its own meta information](../api/README.md#api-meta).

Starting with version 0.4.0 this support for customizing exposure has been moved from [configuration](../api/README.md#configuration) to meta information.


### Accessing Components

For example, the following request handler is accessing a service component named `FileZipper` which is discovered in file **api/service/file-zipper.js**:

```javascript
function someRequestHandler( req, res ) {
    res
        .status( 200 )
        .json( this.api.runtime.services.FileZipper.listFromArchive( "some/archive" ) );
}
```

Optionally, Hitchy's API is available via property `hitchy` of provided request descriptor:

```javascript
function someRequestHandler( req, res ) {
    res
        .status( 200 )
        .json( req.hitchy.runtime.services.FileZipper.listFromArchive( "some/archive" ) );
}
```

Basically, [`req.hitchy`](../api/README.md#req-hitchy) and [`this.api`](../api/README.md#this-api) are both referring to the same API instance. Using `req.hitchy` is beneficial when using arrow functions as well as on passing request descriptor `req` into sub-functions.

Last but not least aliases are provided in context of request handlers for accessing either type of component more conveniently:

```javascript
function someRequestHandler( req, res ) {
    res
        .status( 200 )
        .json( this.services.FileZipper.listFromArchive( "some/archive" ) );
}
```
