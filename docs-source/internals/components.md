# Components

A Hitchy-based application relies on components to be exposed by the application as well as any available plugin. When there are multiple files in installed plugins and your application for the same component all those files are merged in order of plugin discovery.

Either component's file is used to derive the component's name. The former are assumed to be in kebab-case, camelCase or PascalCase. The extension **.js** is always dropped. The component's name is in PascalCase.

:::tip Example
A file in folder **api/services/file-zipper.js** is assumed to provide the service component named **FileZipper**.
:::

Hitchy knows different kinds of components to be introduced here.

## Kinds of Components

### Controllers

Controllers are discovered in folder **api/controllers** of your application as well as any installed plugin. They are meant to expose request handlers that can be addressed in route configuration.

**config/routes.js**
```javascript
exports.routes = {
    "/my/route": "MyController.handleRoute"
};
```

**api/controllers/file.js**
```javascript
module.exports = {
    handleRoute( req, res ) {
        res.send( "Hey!" );
    }
};
```

### Policies

Policy components are discovered in folder **api/policies** of your application as well as any installed plugin. They are meant to expose code that can be injected into request handling as part of policies. They work similar to controllers but thus are addressable in configuration of policies, only.

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

Models are discovered in folder **api/models** of your application as well as any installed plugin. They are used to describe structured data and managing access on it.

:::warning
Hitchy doesn't know much about handling data. You might want to check out existing plugin **hitchy-plugin-odem** for that.
:::

### Services

Service components are discovered in folder **api/services** of your application as well as any installed plugin. They are meant to provide commonly required features and abilities.


## Exposure At Runtime

All components are exposed at runtime via Hitchy's API. In request handlers this API is available as `this.api`. Components are exposed in section **runtime** and grouped by either component's type. That's why there are these collections available:

* `this.api.runtime.controllers` 
* `this.api.runtime.policies` 
* `this.api.runtime.models` 
* `this.api.runtime.services`

:::warning 
In either collection components are exposed using PascalCase name.
:::

For example, the following request handler is accessing a service component named `FileZipper` which is discovered in file **api/service/file-zipper.js**:

```javascript
function( req, res ) {
    res
        .status( 200 )
        .json( this.api.runtime.service.FileZipper.listFromArchive( "some/archive" ) );
}
```
