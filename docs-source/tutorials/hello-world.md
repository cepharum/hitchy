---
next: advanced-routing.md
---

# Tutorial: Hello World!

## Prerequisites

Hitchy is implemented in Javascript and requires [Node.js](https://nodejs.org/) as a runtime. In addition it relies on a tool called [npm](https://www.npmjs.com/) which is used to access a vast amount of modules ready for use. Hitchy is just one of those. This tool is included with Node.js.

## Create Project

* Create and enter folder for your project: `mkdir hello-world && cd hello-world`
* Install Hitchy: `npm i hitchy`

::: tip Information  
You might want to run `npm init` before installing Hitchy to start with a proper description of your project capable of tracking all its dependencies.  
:::

## Configure Router

Create a sub-folder named **config**. Put a file named **routes.js** with the following content there:

```javascript
exports.routes = {
	"/": ( req, res ) => res.send( "Hello World!" ),
};
```

::: warning Important  
The file's name doesn't matter much. The key `routes` used for exporting in first line of file's content is essential though. We suggest name the file just like the exported configuration key to support long-term maintenance of code.  
:::

## Run Project

When in project folder enter 

```sh
hitchy start
``` 

for running the project. This will display some URL to be opened in a web browser, like [http://127.0.0.1:3000](http://127.0.0.1:3000). Click on the URL or copy-n-paste it into your browser to get the desired output.

:::tip Stopping Hitchy
After starting hitchy the service is running in foreground. Log messages are printed on screen. If you want to stop hitchy just press Ctrl+C. This will gracefully shut down Hitchy.
:::
