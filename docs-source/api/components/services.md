# Core Service Components

Hitchy's core framework includes some [service components](../../internals/components.md#services) to be introduced in this document.

## HttpClient

This service component provides a convenient client for sending requests to remote services via HTTP or HTTPS.

### Usage Example

The following excerpt is demonstrating how to use the HttpClient in another component.

```javascript
module.exports = function() {
    const api = this;
    const { services } = api.runtime;

    class YourComponent {
        static checkSomeSite() {
            return services.HttpClient.fetch( "GET", "https://foo.example.com/api/endpoint", null, {
                "x-api-key": "someaccesstoken",
            } )
                .then( response => response.json() )
                .then( data => {
                    // TODO inspect data which is an object
                } );
        }
    }

    return YourComponent;
};
```

### Fetching Resource

Static method **HttpClient.fetch()** is starting new request for fetching resource from provided URL. Its signature is:

```javascript
HttpClient.fetch( method, url, body, headers, options ).then( response => {} );
```

* **method** is selecting HTTP method to use for request.

* **url** is a string or instance of URL describing URL of resource to be fetched.

* **body** provides a request body. It may be:

  * `null` for requests that don't have a request body,
  * a [Buffer](https://nodejs.org/dist/latest/docs/api/buffer.html) sent as-is,
  * a string sent as-is,
  * a readable stream to be consumed for delivering the actual request body or
  * an object to be serialized in JSON format.

* **headers** is a regular object providing a set of custom request headers.

### Processing Response

Method **HttpClient.fetch()** is returning promise which is fulfilled with a response unless encountering severe issues on sending request.

The response is an [IncomingMessage](https://nodejs.org/dist/latest/docs/api/http.html#http_class_http_incomingmessage) basically providing a **statusCode** property containing HTTP status code provided by fetched resource as well as all response headers in property **headers**.

In addition there are two helper methods provided for simplifying access on response body:

* **response.body()** is promising the response body as raw [Buffer](https://nodejs.org/dist/latest/docs/api/buffer.html).
* **response.json()** is promising the data found in response body parsed as JSON-formatted.

You can use both functions simultaneously, but either function is consuming the (remaining) response body, thus you can't consume it yourself after having used either function.

## HttpException

This custom exception class is provided for simplifying controller implementations.

### Usage Example

Let's assume a controller component like this one:

```javascript
module.exports = function() {
	const api = this;
	const { services } = api.runtime;

	const logError = api.log( "my-app:custom:error" );

	class MyCustomController {
		static someEndpoint( req, res ) {
			return Promise.resolve()
				.then( () => {
					if ( req.params.foo !== "expected" ) {
						throw new services.HttpException( 400, "invalid parameter" );
					}
					
					if ( req.query.id !== "john.doe" ) {
						throw new services.HttpException( 403, "access forbidden" );
					}
					
					// TODO provide response
                    // this code might crash unexpectedly ...
				} )
				.catch( error => {
					logError( "request failed: %s", error.statusCode ? 
                        error.message : error.stack );

					res
                        .status( error.statusCode || 500 )
                        .json( { error: error.message } );
				} );
		}
	}
};
```

This example is illustrating how to use **HttpException** in a controller of your Hitchy-based application. By wrapping up all code in a promise it's easy to commonly catch intended exceptions as well as unintended issues of your code in a single late catch handler that is providing a proper response in case of any error. Using **statusCode** property of provided error you can distinguish between intended errors and crashes of your code, thus providing different amounts of information in logging either case.
