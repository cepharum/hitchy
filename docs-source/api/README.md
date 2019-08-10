# Hitchy's API

## Gaining Access

In a fully running application Hitchy's API is available

* in every plugin complying with one of two patterns named _common module pattern_ and _common module function pattern_,
* in any function invoked on routing a request, that is
  * inline functions used in routing configurations,
  * methods of a controller and
  * methods of a policy.

### Using Common Module Pattern

Plugins and components discovered by Hitchy are just software modules that may export an API as usual:

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

:::warning Discovering Modules?
In Hitchy _discovering_ a module is different from _requiring_ it. The term discovery refers to Hitchy's capability of [automatically loading a module during bootstrap](../internals/architecture-basics.md#discovering-plugins). In opposition to that any code of your application may still `require()` modules though **this is going to have some negative side effects for modules relying on _common module pattern_**. 
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
