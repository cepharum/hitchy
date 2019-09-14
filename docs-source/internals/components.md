# Components

A Hitchy-based application relies on components to be exposed by the application as well as any available plugin. When there are multiple files in installed plugins and your application for the same component all those files are merged in order of plugin discovery.

Either component's file is used to derive the component's name. The former are assumed to be in kebab-case, camelCase or PascalCase. The extension **.js** is always dropped. The component's name is in PascalCase.

:::tip Example
A file in folder **api/services/file-zipper.js** is assumed to provide the service component named **FileZipper**.
:::

Hitchy knows four different kinds of components described below. Either kind of component is assumed to be implemented as a [CommonJS module as supported by Node.js](https://nodejs.org/dist/latest/docs/api/modules.html#modules_modules) currently.

## Kinds of Components

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

All components are exposed at runtime in section `runtime` of [Hitchy's API](../api). There are separate groups for every kind of component:

* `this.api.runtime.controllers` 
* `this.api.runtime.policies` 
* `this.api.runtime.models` 
* `this.api.runtime.services`

:::warning 
In either collection components are exposed using PascalCase name derived from its kebab-case filename.
:::

For example, the following request handler is accessing a service component named `FileZipper` which is discovered in file **api/service/file-zipper.js**:

```javascript
function someRequestHandler( req, res ) {
    res
        .status( 200 )
        .json( this.api.runtime.services.FileZipper.listFromArchive( "some/archive" ) );
}
```

In methods of controllers and policies Hitchy's API is exposed as property `hitchy` of provided request descriptor as well:

```javascript
function someRequestHandler( req, res ) {
    res
        .status( 200 )
        .json( req.hitchy.runtime.services.FileZipper.listFromArchive( "some/archive" ) );
}
```

In either example `req.hitchy` and `this.api` are referring to the same API instance. Using `req.hitchy` is beneficial when using arrow functions as well as on passing request descriptor `req` into sub-functions.

:::warning
Support for `req.hitchy` has been introduced in v0.2.0.
:::
