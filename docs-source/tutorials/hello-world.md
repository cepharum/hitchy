# Tutorial: Hello World!

## Create Project

* Create and enter folder for your project: `mkdir hello-world && cd hello-world`
* Initialize project: `npm init`
* Install Hitchy: `npm i hitchy`

## Configure Router

Create a sub-folder named **config**. Put a file named **router.js** with the following content there:

```javascript
exports.router = {
	"/": ( req, res ) => res.send( "Hello World!" ),
};
```

## Run Project

When in project folder enter 

```sh
hitchy .
``` 

for running the project. This will display some URL to be opened in a web browser. Click on the URL or copy-n-paste it to get the desired output.
