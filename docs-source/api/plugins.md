# Hitchy Plugins

In this topic you learn how to write plugins for Hitchy. It is also introducing common API of either plugin as assumed by Hitchy to be integrated properly.

## Basics

Every plugin for Hitchy is a package or simply some local folder containing certain files to be discovered by Hitchy.

### Naming

A plugin's name is equivalent to the base name of folder containing it.

:::tip Example
A plugin locally available in folder **/app/node_modules/hitchy-plugin-tooling** is named **hitchy-plugin-tooling**.
:::

:::warning Convention
When publishing plugins for Hitchy as packages on npm or similar their name should start with **hitchy-plugin-** by convention. See the [moderated list of existing plugins](../plugins.md) for examples.
:::

### Roles

In addition to its name every plugin is assumed to claim a role it is taking as part of an application. This role's name is identical to the plugin's name by default. But every plugin is able to choose a different role explicitly.

#### Why Using Roles?

Roles are beneficial for creating complex applications. By supporting plugin roles it is possible to have different implementations for the same purpose resulting in same API available under same name at runtime.

:::tip Example
The plugin hitchy-plugin-odem is claiming role **odm**. Its API is exposed at runtime as `api.plugins.odm`. 

A different plugin may be designed as a drop-in replacement for **hitchy-plugin-odem** by claiming same role **odm** and providing same API with a different implementation e.g. for interacting with a different backend for storing data.
:::

#### Static vs. Dynamic vs. Approved

For every plugin a claimed role may be encountered in these situations:

1. In its **hitchy.json** beacon file (see below) a plugin may claim role explicitly or rely on role equivalent to its name by default. This role is called the plugin's _static role_.

2. A plugin's API may include property `$meta` to be merged with information read from its **hitchy.json** file before. This may include a `role` in turn which is called the plugin's _dynamic role_.

3. One of these roles - preferring the dynamic role over the static one - becomes the plugin's _approved role_ which is going to be only considered one while integrating either plugin with the application. 

   The approved role of a plugin will be exposed as property `$role` of its API.

#### Uniquity

A plugin's role must be unique in context of a single application. 

Thus, in a single application you can't have two plugins claiming same role except for one situation: A plugin's dynamic role is accepted over always preferred over some other plugin claiming same role statically, only. This is meant to have a plugin inspecting all the available plugins and deciding to provide a superior implementation to be used in preference.

## The Beacon File

Every folder or package meant to be discovered as a Hitchy plugin must contain a file named **hitchy.json**. This file doesn't have to contain any information and thus could be as simple as this:

```json
{}
```

The file is used as a _beacon_ indicating its folder to contain a plugin for Hitchy. By relying on its presence discovering plugins is pretty fast resulting in shorter startup times.

There may be actual content in the file, though. 

* The content is playing an essential part in integrating either plugin as it might describe a plugin's slight deviation from API assumed by Hitchy. 

* It may give explicit values for defaults assumed otherwise. 

* Another option is declaring other plugins either plugin depends on. This is resulting in a certain dependency graph which is used to create a properly sorted list of plugins obeyed while integrating them with an application as well as on routing requests through routes exposed by either plugin.

Last but not least there may be custom information which is [exposed as part of either plugin's API](#plugin-meta).

### role

This property of **hitchy.json** file is statically claiming a certain [role](#roles) by name. It defaults to the plugin's name which in turn is equivalent to the filename of folder containing the **hitchy.json** file.

In opposition to that either plugin gets a chance to claim a different role dynamically e.g. after inspecting whole list of actually discovered plugins.

### dependencies

Either plugin may declare _roles_ of plugins it depends on. This affects bootstrap in several ways:

* When sorting plugins for sequential processing any plugin listing roles as its dependencies here is processed after those plugins claiming either role.

* If any of the declared dependencies is missing the bootstrap fails cancelling whole application startup.

:::tip Example
The plugin **hitchy-plugin-odem-rest** is declaring to depend on role **odm** which is claimed by plugin **hitchy-plugin-odem**.

**hitchy-plugin-odem-rest/hitchy.json:**
```json
{
	"role": "odm-provider",
	"dependencies": [
		"odm"
	]
}
```
:::

### dependants

A plugin is capable of listing roles depending on it without requiring plugins claiming those roles to declare related dependency on their own. 

Using this property is less common but supported for sake of integrity as it is controlling sorting order of plugins in direction opposite to declaring dependencies as described above.

## Common Plugin API

This is a summary of properties and methods in a plugin's API supported by Hitchy for integrating the plugin with an application. See the [description of process integrating plugins](../internals/plugin-integration.md) for additional information.

## A Plugin's Particular API

In addition to complying with Hitchy's Plugin API every plugin may expose its own API to be made available as part of Hitchy's API available at runtime of a Hitchy-based application.

A plugin's API is specific to either plugin and thus you should read related documentation of plugins used. 

However, when integrating a plugin Hitchy is adding some properties describing the plugin and its integration with the application. These are listed below.

### plugin.$name

This property names the plugin which is exposing this API.

### plugin.$role

This property names the role claimed by plugin exposing this API. Since accessing the plugin involves knowing the role this information may be considered redundant but is included for sake of integrity.

### plugin.$meta

This object is representing code of plugin's hitchy.json file merged with additional information provided by plugin during its discovery and integration. It might be used to access custom information included with a plugin's hitchy.json file.

### plugin.$index

Due to sorting plugins for sequential processing either plugin has an index into that list which is exposed in this property mostly for testing purposes.
