---
prev: hello-world.md
next: vue.md
---

# Tutorial: Advanced Routing

:::tip
This tutorial continues the project started in [Hello World](./hello-world.md)-example.
:::


## Trying Changes

This tutorial is going to show-case several ways of defining [routes and policies](../internals/routing-basics.md). Feel free to restart the project intermittently by running 

```sh
hitchy start
```

and try URLs defined in either case.


## Using Controllers

Instead of putting handlers for routes into the router configuration you should start working with _controllers_. 

:::tip
Controllers are [components](../internals/components.md) of a Hitchy-based application.
:::

Create new file **api/controllers/hello.js** with the following content:

```javascript
module.exports = {
    world( req, res ) {
        res.send( "Hello World!" );
    }
};
```

Open file **config/routes.js** created as part of previous tutorial and replace its content with the following one:

```javascript
exports.routes = {
    "/": ( req, res ) => res.send( "Hello World!" ),
    "/colon": "hello::world",
    "/period": "hello.world",
    "/object": { controller: "hello", method: "world" },
    "/colon/decorated": "HelloController::world",
    "/period/decorated": "HelloController.world",
    "/object/decorated": { controller: "HelloController", method: "world" },
};
```

This defines different routes resulting in the same output on request. However, all but the first one are using the controller created before. They use different supported way for addressing a controller and a method exposed by either controller. 

Neither way of addressing a controller's method should be mistaken as actual code.

:::tip Try it!
Restart project and open [http://127.0.0.1:3000/array/decorated](http://127.0.0.1:3000/array/decorated) in your browser now.
:::


## Defining Routes per Method

In HTTP every request selects a method, like GET, POST or PUT. This method information can be used for matching routes. The default is GET. You might select any different method by prepending it to the path name of your routing definition:

**config/routes.js**
```javascript
exports.routes = {
    "/": ( req, res ) => res.send( "Hello World!" ),
    "GET /colon": "hello::world",
    "POST /period": "hello.world",
    "DELETE /object": { controller: "hello", method: "world" },
    "PATCH /colon/decorated": "HelloController::world",
    "ALL /period/decorated": "HelloController.world",
    "* /object/decorated": { controller: "HelloController", method: "world" },
};
```

The last two cases show special case of using method `ALL` or `*`. This defines to apply this routing without regards to a request's method.

:::tip Try it!
In opposition to the previous case some of the routes can't be tested in browser that simply, anymore. Testing those routes bound to method POST, DELETE or PATCH result in different result showing _Page not found_ error.
:::


## What about Policies?

[Policies](../internals/routing-basics.md#policies) are working very similar to controllers as described before.

Create a file **api/policies/filter.js** with the following content:

```javascript
module.exports = {
    failOnDemand( req, res, next ) {
        if ( req.query.fail ) {
            this.api.log( "hitchy:request" )( "responding on failure" );
            res.status( 400 ).send( "Failed!" );
        } else {
            next();
        }
    }
};
```

:::tip
A special Hitchy API is exposed as `this.api` in request handlers. This API includes a logging service which is used here.
:::

Next create a file **config/policies.js** with the following content:

```javascript
exports.policies = {
    "/period": "filter.failOnDemand",
    "/object/decorated": "FilterPolicy::failOnDemand",
};
```

Of course you could also use the other styles of addressing a target as demonstrated on routes before.

Major differences with regards to configuration as shown here are:

* The decorated version of a policy component uses suffix **Policy** instead of **Controller**.
* The configuration is exposed via `exports.policies` instead of `exports.routes`.
* As described in [routing basics](../internals/routing-basics.md) policies apply to all requests matching prefix of request path name.

:::tip Try It!
Restart project and open [http://127.0.0.1:3000/object/decorated?fail=1](http://127.0.0.1:3000/object/decorated?fail=1) in your browser now. It will show `Failed!` instead of `Hello World!`. By removing the `?fail=1` the greeting returns. In addition there is an output in console used to run Hitchy.
:::


## About Routing Slots

In [routing basics](../internals/routing-basics.md) you've learned about [routing slots](../internals/routing-basics.html#routing-slots). In your application's configuration you can split up your definition of routes and policies to apply to separate slots of routing:

In file **config/routes.js** or **config/policies.js** you can replace configurations like these

```javascript
exports.policies = {
    "/period": "filter.failOnDemand",
    "/object/decorated": "FilterPolicy::failOnDemand",
};
```

with grouped configurations like

```javascript
exports.policies = {
    before: {
        "/period": "filter.failOnDemand",
    },
    late: {
        "/object/decorated": "FilterPolicy::failOnDemand",
    },
};
```

This would apply the previously declared policy routings into separate slots of separate routing stages.

:::tip Try it!
By applying the latter policy to the _late_ slot the URL [http://127.0.0.1:3000/object/decorated?fail=1](http://127.0.0.1:3000/object/decorated?fail=1) wouldn't result in displaying `Failed!` this time. However, the policy is used nonetheless, as you can see by the log message in Hitchy's output.
:::


## Routing Parameters

Hitchy depends on popular [path-to-regexp](https://www.npmjs.com/search?q=path%2Dto%2Dregexp) to support highly flexible definition of request paths. This includes definition of named parameters to be exposed in context of request handlers.

Append the following route definition in **config/routes.js**. This time you should know how to achieve that.

```javascript
"/greet/:clientName": "Hello::world"
```

In **api/controllers/hello.js** replace existing method world with this one:

```javascript
world( req, res ) {
    res.send( `Hello ${req.params.clientName || "world"}!` );
}
```

:::tip Try it!
After restarting the response gets personal when requesting URL like [http://127.0.0.1:3000/greet/John](http://127.0.0.1:3000/greet/John) in your browser.
:::
