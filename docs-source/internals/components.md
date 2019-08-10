# Components

A Hitchy-based application relies on components to be exposed by the application as well as any available plugin. When there are multiple files in installed plugins and your application for the same component all those files are merged in order of plugin discovery.

Either component's file is used to derive the component's name. The former are assumed to be in kebab-case, camelCase or PascalCase. The extension **.js** is always dropped. The component's name is in PascalCase.

:::tip Example
A file in folder **api/services/file-zipper.js** is assumed to provide the service component named **FileZipper**.
:::

Hitchy knows four different kinds of components described below. Either kind of component is assumed to be implemented as a [CommonJS module as supported by Node.js](https://nodejs.org/dist/latest/docs/api/modules.html#modules_modules) currently.

## Kinds of Components

### Controllers

A controller is a software module or class that is exposing methods for eventually handling requests and sending some response. Controllers are discovered in folder **api/controllers** of your application as well as any installed plugin.

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


### Policies

A policy is a software module or class just like a controller. However, it is meant to handle requests collaboratively with other policies and some final controller. Thus it might ignore requests or adjust request information without ever responding to any request. Multiple policies may be involved in processing a single request. That's why policies are capable of passing control to next available policy in chain of processing policies which isn't possible for a controller.

Policies are always able to send a response nonetheless. That's useful for implementing filters next to controllers.

A final difference between controllers and policies regards the way they are picked to be involved in processing a particular request. Policies are applied to requests sharing prefix of URL path. A controller is obeyed when fully matching a request's URL path.

Policy components are discovered in folder **api/policies** of your application as well as any installed plugin.

**config/routes.js**
```javascript
exports.policies = {
    "/": "BodyPolicy.mark"
};
```

**api/policies/body.js**
```javascript
module.exports = {
    mark( req, res, next ) {
        req.marked = true;
        next();
    }
};
```


### Models

Models are modules or classes describing data to be managed by your application. They are meant to be an interface for accessing data in an attached data storage like a database.

:::warning
Hitchy doesn't know much about handling data itself. However, there is a pretty powerful [plugin](https://www.npmjs.com/package/hitchy-plugin-odem) you definitely want to check out.
:::

They are discovered in folder **api/models** of your application as well as any installed plugin.


### Services

Services are software modules or classes as well. They are meant to implement and provide features that are commonly required in controllers, policies and models. Whenever there is code to be used redundantly you should put it in a service.

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
        .json( this.api.runtime.service.FileZipper.listFromArchive( "some/archive" ) );
}
```
