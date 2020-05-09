# Hitchy Design Principles

Hitchy is meant to comply with many common paradigms such as [DRY](https://de.wikipedia.org/wiki/Don%E2%80%99t_repeat_yourself) and [KISS](https://en.wikipedia.org/wiki/KISS_principle). In addition Hitchy developers are asked to comply with the following set of custom principles and paradigms as good as possible:


## Convention over Configuration

In Hitchy there are many conventions simplifying day to day software development when obeyed. And many features aren't meant to depend on some configuration. So, don't try to bend Hitchy e.g. for matching a naming scheme or project hierarchy you prefer but accept conventions laid out by Hitchy and coding will be fun for sure.


## Keep It Lean!

npm offers a huge amount of ready-to-use packages and most of them tend to rely on this offer by depending on more packages. This quite often results in tons of packages fetched from npm for running your application even when it is kept rather simple.

We fight this discrepancy by preventing use of dependencies for getting some feature that might take just 10-20 lines of code. Omit dependencies unless they make sufficient sense and offer substantial benefits. There are some rules for guiding:

* Always have a look into either used dependency. 
* Assess the code yourself.
* Try relying on popular and well-established dependencies, only.
* Always check the dependencies of either dependency as well.
* Avoid stale dependencies.
* Decide if it's worth adding tens, hundreds or even thousands of new files just to get some feature that requires some tens of lines of code.


## Speak Promises! 

Using _natively supported_ promises is highly beneficial over using callbacks with regards to handling asynchronous processing and related error handling. Hitchy doesn't try to support different ways of handling asynchronous processing but sticks with promises by convention to keep the code as simple as possible.


## Performance over Code Simplicity

This principle looks contrary to others listed here for sure. However, due to lack of transpilers properly helping with bridging this gap, Hitchy keeps an eye on performance.

* Work synchronously as long as possible.
* Take a local copy of some expensively accessible information.

  ```javascript
  // BAD
  for ( let i = 0; i < array.length; i++ ) { ... }

  // BETTER
  for ( let i = 0, num = array.length; i < num; i++ ) { ... }

  // BAD
  some.data[x].result = fn( some.data[x].info, some.data[x].additional );

  // BETTER
  const ref = some.data[x];
  ref.result = fn( ref.info, ref.additional );
  ```

* Befriend with references.   

  ```javascript
  const ref = some.data[x];
  ref.result = fn( ref.info, ref.additional );
  ```

* Prevent frequent use of stack frames.

  ```javascript
  // BAD
  hugeArrayOfIntegers.filter( i => i > 0 ).map( i => `prefix-${i}` );
  
  // BETTER
  const numOfItems = hugeArrayOfIntegers.length;
  const result = [];

  for ( let i = 0; i < numOfItems; i++ ) {  
    const item = hugeArrayOfIntegers[i];
    if ( item > 0 ) {
      result.push( `prefix-${item}` );
    }
  }
  ```

* Always work asynchronously when starting some action that might block even for a moment.
* Embrace streams to limit consumption of memory.
* Keep an eye on what might happen under the hood of Javascript engine.
* Check out [popular tests at JSPerf](https://jsperf.com/popular) or [try it yourself](https://jsperf.com/).

Because of these principles the code of Hitchy is sometimes hard to read as it focuses on performance instead of readability.
