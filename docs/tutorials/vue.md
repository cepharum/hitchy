# Getting Started: Hitchy & Vue

Hitchy as a framework is suitable for implementing a server-side business logic. Even though you could have some server-side rendering of views, too, implementing separate client-side applications is rather common nowadays.

In this tutorial you'll learn how to combine Hitchy with Vue to achieve right that.


## Prerequisites

First of all, a local installation of [Node.js](https://nodejs.org/en/) is required. 

In addition, Vue CLI must be installed globally using `npm` which comes included with Node.js.

  ```bash
  npm install -g @vue/cli
  ```

Optionally use [git](https://git-scm.com/) for version management.

## Create Project

Create and enter a new folder for containing whole project:

```bash
mkdir myapp
cd myapp
```

Initialize **git** or any other version control system in project folder:

```bash
git init
```

Create a file **.gitignore** containing 

```
.idea
.vscode
**/node_modules
**/npm-debug.log
data
server/public
```

Commit initial version:

```bash
git add .
git commit -a -m "initial commit"
```

### Vue Part

With CLI still residing in project folder **myapp**, create Vue project in sub-folder **frontend**:

```bash
vue create -n frontend
```

Pick preferred set of tools. We suggest using **vue-router** and **vuex**. Save it for re-using with upcoming projects.

### Hitchy Part

While still residing in project folder **myapp** it's time to create another sub-folder **server** containing Hitchy-based server side of application:

```bash
mkdir server
cd server
npm init -y
npm install hitchy hitchy-plugin-static hitchy-plugin-proxy hitchy-plugin-odem hitchy-plugin-odem-rest
``` 

Adjust the file **myapp/server/package.json** by adding `start` in `scripts`, adding `private` property and removing `main` property:

```json
{
  "name": "server",
  "version": "1.0.0",
  "private": true,
  "description": "",
  "scripts": {
    "start": "hitchy start",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

Optionally use these tools for testing server-side code:

```bash
npm install -D eslint eslint-plugin-promise eslint-config-cepharum mocha should hitchy-server-dev-tools
```

Integrate them with **package.json** file modified before:

```json
{
  "name": "server",
  "version": "1.0.0",
  "private": true,
  "description": "",
  "scripts": {
    "start": "hitchy start",
    "lint": "eslint .",
    "test": "mocha --ui tdd 'test/**/*.spec.js'"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "eslintConfig": {
    "extends": ["eslint-config-cepharum"]
  }
}
```

## Wrap Vue in Hitchy

Using two separate plugins Hitchy is configured to deliver the Vue-based frontend application in development setups as well as in production use. You should always support either scenario.

* **For simplified use during development** 

  Create a file **myapp/server/config/proxy.js** containing

  ```javascript
  exports.proxy = process.env.NODE_ENV === "production" ? [] : [
    {
      prefix: "/",
      target: "http://127.0.0.1:8080/"
    }
  ];
  ```

  This enables reverse proxy plugin of Hitchy forwarding all requests not matching any more specific route to the development server of Vue assumed to be running locally as well.

* **For eventual production use**

  Create a file **myapp/server/config/static.js** containing

  ```javascript
  exports.static = process.env.NODE_ENV === "production" ? [
    {
      prefix: "/",
      folder: "public",
      fallback: "index.html"
    }
  ] : [];
  ```

  This causes Hitchy to statically expose all files in the folder **myapp/server/public**.

  Add option **outputDir** in file **myapp/frontend/vue.config.js**:

  ```javascript
  module.exports = {
    lintOnSave: false,
    outputDir: "../server/public"
  }
  ```

  This setting is causing builds of Vue application being written to **myapp/server/public** accordingly.

## Test Run

Now it's time to start Vue's development server and Hitchy. Invoke

```bash
npm run serve
```

in context of sub-folder **frontend** for starting Vue and

```bash
npm run start
```

in context of sub-folder **server** for starting Hitchy. Observe output of the latter for picking URL to open in a browser. This will present home screen of Vue skeleton created before.

## Customize Hitchy

### Use Persistent Data Backend

For Hitchy's ODM persistently saving data you need to set up an adapter. You can go without, but the ODM is using in-memory backend by default, thus loosing all data on restarting server-side of application.

Create a file **myapp/server/config/database.js** with following content:

```javascript
const Path = require( "path" );

module.exports = function() {
	return {
		database: {
			default: {
				adapter: new this.runtime.services.OdemAdapterFile( {
					dataSource: Path.resolve( __dirname, "../../data" ),
				} ),
			},
		},
	};
};
```

This is selecting another ODM backend shipped with ODM plugin itself for storing data in local file system. The configured folder will be **myapp/data** and that's why it has been listed in **.gitignore** file created earlier.

:::warning Production Use  
It's basically okay to use this backend in production setup, as well, unless you are running your application as a single instance in a cluster _without_ reliable access to some "local" filesystem. In addition, you _shouldn't ever_ use it on running multiple instances of your application in a cluster reliably sharing a local filesystem for Hitchy's ODM isn't made for that. Please refer to [manual of separate plugin](https://www.npmjs.com/package/hitchy-plugin-odem-etcd) for connecting the ODM with an **etcd** cluster.  
:::

