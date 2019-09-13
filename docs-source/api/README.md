# Hitchy's API

## Gaining Access

In a fully running application Hitchy's API is available

* in every plugin complying with one of two patterns named _common module pattern_ and _common module function pattern_,
* in any function invoked on routing a request, that is
  * inline functions used in routing configurations,
  * methods of a controller and
  * methods of a policy.

### Using Common Module Pattern

Plugins and components discovered by Hitchy are (consisting of) modules that may export an API as usual:

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

This example shows a software module that's exposing two functions to be its API the usual way.

Hitchy's core supports so called _common module pattern_ when _discovering_ plugins and their components.

:::warning Discovering Plugins?
In Hitchy _discovering_ a plugin is different from _requiring_ it. The term discovery refers to Hitchy's capability of [automatically loading a plugin during bootstrap](../internals/architecture-basics.md#discovering-plugins). In opposition to that any code of your application may still `require()` modules the usual way though **this is going to have some negative side effects for modules relying on _common module pattern_**. 
::: 

The common module pattern is a convention allowing any complying module to export a function instead of its API. This function is invoked by Hitchy's bootstrap code to retrieve the actual API of the module:

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

This is the counterpart of same module as before. But this time it is relying on the common module pattern mostly to gain access on Hitchy's API. During discovery of plugins and components any function exported from either module is invoked with Hitchy's API provided as `this` and global options describing runtime context and arguments passed on starting Hitchy in first argument.

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


### In Request Handlers

In request handlers the API is exposed in two different ways:

1. Every request handler is invoked with `this` referring to some _request context_ which is including reference on Hitchy's API in property `api`:

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

## API Elements

tba.

## Request Helpers

In request handlers there are two provided arguments usually named `req` and `res`. The former is basically an [IncomingMessage](https://nodejs.org/dist/latest/docs/api/http.html#http_class_http_incomingmessage) and the latter is a [ServerResponse](https://nodejs.org/dist/latest/docs/api/http.html#http_class_http_serverresponse). But either object is extended to provide additional information and functionality.

### `req.accept`

A properly sorted list of MIME type ranges is provided in this property according to any current request's [Accept](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept) header field. There is always a list of MIME ranges and either item is provided without optional parameters.

:::tip Example
When handling request with header `Accept: text/*;q=0.5, text/json` this property will expose sorted list of given MIME ranges `[ "text/json", "text/*" ]`.
:::

### `req.cookies`

:::warning Requires Plugin
This property requires installation of plugin [hitchy-plugin-cookies](https://www.npmjs.com/package/hitchy-plugin-cookies) as a dependency of your project.
:::

This property exposes object containing all cookies transmitted by client in current request.

### `req.fetchBody( parser )`

This method promises request's body. The optional parameter can be used to control parser used for extracting contained information.

:::warning
When integrating with ExpressJS this function has limited capabilities to access the raw body and parsed for custom content.
:::
 
* When omitted or set `null` any parser function in configuration is used to commonly parse raw body for contained information. When there is no configured parser some fallback is used supporting JSON and form-encoded request bodies.

* On providing function here this one is used to parse the raw body instead of any configured or fallback parser.

* On providing `false` the raw body is promised as instance of Buffer. This is bypassing any parser to be invoked thus won't result in caching some parser's output as well.

  :::warning
  This method is caching any previously extracted body data. Thus, re-invoking this method with a different parameter doesn't result in another set of information but fetches the same result as before.

  Providing `false` is the only exclusion from this rule.
  :::

### `req.hitchy`

This property is exposing [Hitchy's API](#hitchys-api).

### `req.params`

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

### `req.path`

This property conveniently provides current request's path which is the requested URL without any appended query string or hash.

:::tip Example
On requesting `/some/path/name?with=arg` this property will provide `/some/path/name`.
:::

### `req.query`

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

### `req.session`

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
Those additional methods listed below are providing fluent interface for chaining multiple invocations. However, signatures of methods natively supported by response manager aren't adjusted.

```javascript
res.status( 400 ).set( "content-type", "text/json" ).send( { ... } );
```
:::

:::tip Preventing Response on HEAD Requests <Badge type="info">v0.2.2+</Badge>
Requests using HTTP method HEAD must not provide a response. Disobeying this usually results in exceptions thrown e.g. on trying to send some JSON-formatted response.

Hitchy is designed to detect any such request limiting capabilities of response manager's methods related to describing some actual content. That's why you don't need to take care of omitting response content in handlers supported HEAD requests as well.
:::

### `res.format( handlers )`

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

### `res.json( data )`

This method generates a JSON-formatted response and sends it to the client. It is ending current response implicitly.

:::tip Example
```javascript
res.json( { some: "data" } );
```
:::

### `res.redirect( statusCode, url )`

Use this helper to instantly generate and send response requesting user to fetch different URL for some desired information.

:::tip Example
```javascript
res.redirect( 301, "https://example.com/" );
```
:::

### `res.send( content )`

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

### `res.set( name, value )`

Adjusts single field of response header. Internally this function is invoking `res.setHeader()`.

:::tip Example
```javascript
res.set( "content-type", "text/json;charset=utf8" );
```

```javascript
res.set( "x-api-level", "3" );
```
:::

### `res.set( fields )`

Adjusts multiple fields of response header at once. Internally this function is invoking `res.setHeader()` for every listed header field.

:::tip Example
```javascript
res.set( {
    "content-type": "text/json;charset=utf8",
    "x-api-level": "3"
} );
```
:::

### `res.status( code )`

Adjusts HTTP response status code.

:::tip Example
```javascript
res.status( 404 ).json( { error: "no such data" } )
```
:::

### `res.type( mime )`

Adjusts `content-type` header field of response supporting several aliases for simplified selection of response type.

:::tip Example
```javascript
res.type( "json" ).send( JSON.stringify( true ) )
```

```javascript
res.type( "image/png" ).send( bufferContainingPNG )
```
:::
