(window.webpackJsonp=window.webpackJsonp||[]).push([[12],{53:function(i,t,e){"use strict";e.r(t);var n=e(0),o=Object(n.a)({},function(){var i=this,t=i.$createElement,e=i._self._c||t;return e("ContentSlotsDistributor",{attrs:{"slot-key":i.$parent.slotKey}},[e("h1",{attrs:{id:"integrating-plugins"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#integrating-plugins","aria-hidden":"true"}},[i._v("#")]),i._v(" Integrating Plugins")]),i._v(" "),e("p",[i._v("This topic is providing a brief description of Hitchy's bootstrap operation and the way it is discovering and integrating available plugins.")]),i._v(" "),e("p",[i._v("On startup Hitchy is discovering available plugins and integrating them with the application. This process is tightly bound to "),e("router-link",{attrs:{to:"/internals/architecture-basics.html#discovering-plugins"}},[i._v("bootstrap stages")]),i._v(".")],1),i._v(" "),e("h2",{attrs:{id:"triangulation"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#triangulation","aria-hidden":"true"}},[i._v("#")]),i._v(" Triangulation")]),i._v(" "),e("p",[i._v("During triangulation phase there is no interaction with plugins for they haven't been discovered yet. It is mostly about Hitchy processing options customizing its behaviour and detecting an application's project folder as well its folder assumed to contain any available plugin.")]),i._v(" "),e("p",[i._v("In triangulation Hitchy is qualifying some of the supported "),e("router-link",{attrs:{to:"/api/#options"}},[i._v("options")]),i._v(". And it tries to find base folder of project to be managed by Hitchy unless it has been given on invocation explicitly.")],1),i._v(" "),e("div",{staticClass:"tip custom-block"},[e("p",{staticClass:"custom-block-title"},[i._v("Finding Application Folder")]),i._v(" "),e("p",[i._v("Unless providing application's project folder on invocation Hitchy is checking one of these supported use cases accepting the first one matching:")]),i._v(" "),e("ol",[e("li",[e("p",[i._v("Hitchy assumes current working directory is project folder of application to be managed. The folder is accepted when containing sub-folder named "),e("strong",[i._v("node_modules")]),i._v(". Otherwise parent folder of current working directory is tried. This process is repeated until either root folder of local file system has been reached or some folder containing "),e("strong",[i._v("node_modules")]),i._v(" has been found.")])]),i._v(" "),e("li",[e("p",[i._v("Hitchy assumes to be installed as a dependency of its application or some dependency of a dependency of its application etc. In this case it is starting at its own folder assumed to be contained in a "),e("strong",[i._v("node_modules")]),i._v(" folder itself, thus testing its grandparent folder.")])])])]),i._v(" "),e("h2",{attrs:{id:"discovery"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#discovery","aria-hidden":"true"}},[i._v("#")]),i._v(" Discovery")]),i._v(" "),e("p",[i._v("In discovery stage Hitchy is searching local filesystem for folders containing "),e("strong",[i._v("hitchy.json")]),i._v(" file. On every match the containing folder is considered an available Hitchy plugin. The "),e("strong",[i._v("hitchy.json")]),i._v(" file is read first providing static meta information on either plugin.")]),i._v(" "),e("div",{staticClass:"tip custom-block"},[e("p",{staticClass:"custom-block-title"},[i._v("Folders Searched For Plugins")]),i._v(" "),e("p",[i._v("By default, Hitchy is starting at application's folder. There it is deeply searching for any sub-folder in "),e("strong",[i._v("./node_modules")]),i._v(" containing a file named "),e("strong",[i._v("hitchy.json")]),i._v(". It is ignoring folders marked as hidden by name with leading period.")]),i._v(" "),e("p",[i._v("It is possible to explicitly select different folder to start from using option "),e("strong",[i._v("extensionFolder")]),i._v(".")]),i._v(" "),e("p",[i._v("Mostly for testing purposes it is possible provide a list of folders to be considered plugin folders explicitly using option "),e("strong",[i._v("explicitExtensions")]),i._v(". It is also possible to prevent Hitchy from searching folder mentioned before by setting option "),e("strong",[i._v("explicitFoldersOnly")]),i._v(". Neither option is supported by Hitchy's CLI script, though.")])]),i._v(" "),e("h3",{attrs:{id:"loading-plugin"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#loading-plugin","aria-hidden":"true"}},[i._v("#")]),i._v(" Loading Plugin")]),i._v(" "),e("p",[i._v("After detecting and loading an existing "),e("strong",[i._v("hitchy.json")]),i._v(" file the plugin's folder is loaded as a module using "),e("code",[i._v("require()")]),i._v(" while supporting compliance with "),e("router-link",{attrs:{to:"/api/#using-common-module-pattern"}},[i._v("common module pattern")]),i._v(". A plugin should provide an "),e("strong",[i._v("index.js")]),i._v(" file exposing the plugin's API. It might "),e("a",{attrs:{href:"https://docs.npmjs.com/files/package.json#main",target:"_blank",rel:"noopener noreferrer"}},[i._v("select different filename"),e("OutboundLink")],1),i._v(", too.")],1),i._v(" "),e("p",[i._v("Whatever this file exports is considered the plugin's API.")]),i._v(" "),e("h3",{attrs:{id:"merging-meta-information"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#merging-meta-information","aria-hidden":"true"}},[i._v("#")]),i._v(" Merging Meta Information")]),i._v(" "),e("p",[i._v("For every discovered plugin its (static) meta information read from "),e("strong",[i._v("hitchy.json")]),i._v(" file is merged with its (dynamic) meta information optionally provided in property "),e("code",[i._v("$meta")]),i._v(" of plugin's API. The result is replacing the latter.")]),i._v(" "),e("div",{staticClass:"tip custom-block"},[e("p",{staticClass:"custom-block-title"},[i._v("Static vs. Dynamic")]),i._v(" "),e("p",[i._v("By relying on common module pattern a plugin is capable of computing information in API property "),e("strong",[i._v("$meta")]),i._v(". That's why this is called "),e("em",[i._v("dynamic")]),i._v(" meta information in opposition to the uncomputed, thus "),e("em",[i._v("static")]),i._v(" meta information read from "),e("strong",[i._v("hitchy.json")]),i._v(" file.")]),i._v(" "),e("p",[i._v("This option includes meta information like a plugin's role or its dependencies, thus allowing either plugin to pick a role or its dependencies dynamically.")])]),i._v(" "),e("h3",{attrs:{id:"sorting-plugins"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#sorting-plugins","aria-hidden":"true"}},[i._v("#")]),i._v(" Sorting Plugins")]),i._v(" "),e("p",[i._v("After compiling all discovered plugins' meta information Hitchy is capable of creating a dependency graph of those plugins and sort them accordingly from plugins many other plugins rely on to those ones no other plugin relies on.")]),i._v(" "),e("div",{staticClass:"tip custom-block"},[e("p",[i._v("Any follow-up action regarding "),e("em",[i._v("every plugin")]),i._v(" is obeying this sorting order. In shutdown stage as well as in handling late policies the order is reversed.")])]),i._v(" "),e("h3",{attrs:{id:"notify-plugin-on-discovery"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#notify-plugin-on-discovery","aria-hidden":"true"}},[i._v("#")]),i._v(" Notify Plugin on Discovery")]),i._v(" "),e("p",[i._v("At the end of discovery stage every discovered plugin is notified on being discovered when exposing a method named "),e("code",[i._v("onDiscovered()")]),i._v(" as part of its API.")]),i._v(" "),e("p",[i._v("This notification comes early in a plugin's life cycle and thus it mustn't rely on too many context-related information available, yet. Either function is invoked with "),e("code",[i._v("this")]),i._v(" referring to Hitchy's partially compiled API and Hitchy options, names of all discovered plugins and either plugin's handle as arguments.")]),i._v(" "),e("h2",{attrs:{id:"configuration"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#configuration","aria-hidden":"true"}},[i._v("#")]),i._v(" Configuration")]),i._v(" "),e("p",[i._v("In configuration stage the application's configuration is compiled from every plugin and the application itself.")]),i._v(" "),e("h3",{attrs:{id:"collecting-compiling"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#collecting-compiling","aria-hidden":"true"}},[i._v("#")]),i._v(" Collecting & Compiling")]),i._v(" "),e("p",[i._v("Every plugin as well as the application is assumed to provide one or more configuration files with extension "),e("strong",[i._v(".js")]),i._v(" in sub-folder "),e("strong",[i._v("config")]),i._v(". Hitchy is reading all those files merging them into a single configuration object which is exposed as part of Hitchy's API at "),e("code",[i._v("api.runtime.config")]),i._v(".")]),i._v(" "),e("h3",{attrs:{id:"final-notification"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#final-notification","aria-hidden":"true"}},[i._v("#")]),i._v(" Final Notification")]),i._v(" "),e("p",[i._v("After having compiled this object every plugin is notified by invoking method "),e("code",[i._v("configure()")]),i._v(" optionally available in either plugin's API. Either function is invoked with "),e("code",[i._v("this")]),i._v(" referring to Hitchy's partially compiled API and Hitchy options as well as either plugin's handle as arguments.")]),i._v(" "),e("h2",{attrs:{id:"exposure"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#exposure","aria-hidden":"true"}},[i._v("#")]),i._v(" Exposure")]),i._v(" "),e("p",[i._v("Exposure stage is meant to compile components listed in section "),e("code",[i._v("api.runtime")]),i._v(" of Hitchy's API.")]),i._v(" "),e("h3",{attrs:{id:"early-notification"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#early-notification","aria-hidden":"true"}},[i._v("#")]),i._v(" Early Notification")]),i._v(" "),e("p",[i._v("This stage starts with a notification called "),e("code",[i._v("onExposing()")]),i._v(". This notification is useful for accessing final configuration for the first time.")]),i._v(" "),e("p",[i._v("Every interested plugin must export a method called "),e("code",[i._v("onExposing()")]),i._v(" in its API. Just like before, the function is invoked with "),e("code",[i._v("this")]),i._v(" referring to still partial Hitchy API and Hitchy options as well as either plugin's handle as arguments.")]),i._v(" "),e("h3",{attrs:{id:"collecting-deriving-replacing"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#collecting-deriving-replacing","aria-hidden":"true"}},[i._v("#")]),i._v(" Collecting, Deriving, Replacing")]),i._v(" "),e("p",[i._v("After that, components of every plugin are loaded prior to loading those provided by current application.")]),i._v(" "),e("p",[i._v("Found components are instantly exposed in Hitchy's API so that plugins as well as the application are able to see those components e.g. for deriving new components from those exposed by preceding plugins. In addition every plugin may replace previously exposed components by re-exposing another component with the same name.")]),i._v(" "),e("h3",{attrs:{id:"final-notification-2"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#final-notification-2","aria-hidden":"true"}},[i._v("#")]),i._v(" Final Notification")]),i._v(" "),e("p",[i._v("Just like in previous stages a notification is dispatched by invoking method "),e("code",[i._v("onExposed()")]),i._v(" for every plugin that's exporting this function as part of its API. Its signature is equivalent to that one of "),e("code",[i._v("onExposing()")]),i._v(" described before.")]),i._v(" "),e("h2",{attrs:{id:"initialisation"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#initialisation","aria-hidden":"true"}},[i._v("#")]),i._v(" Initialisation")]),i._v(" "),e("p",[i._v("In initialisation stage configuration and all components are available. Every plugin gets opportunity to initialise its state for runtime, e.g. by establishing connections to databases or similar.")]),i._v(" "),e("div",{staticClass:"tip custom-block"},[e("p",[e("a",{attrs:{href:"#shutdown"}},[i._v("Shutdown stage")]),i._v(" is supported as a counterpart to this stage.")])]),i._v(" "),e("p",[i._v("For every plugin a method "),e("code",[i._v("initialize()")]),i._v(" exported as part of its API is invoked. The function is invoked with "),e("code",[i._v("this")]),i._v(" referring to Hitchy's API and Hitchy options as well as either plugin's handle provided as arguments.")]),i._v(" "),e("p",[i._v("Application may provide its initialisation code to be invoked after having initialised all plugins. Applications requiring special setup provide a file named "),e("strong",[i._v("initialize.js")]),i._v(" in project folder. This file is invoked in compliance with common module pattern.")]),i._v(" "),e("h2",{attrs:{id:"routing"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#routing","aria-hidden":"true"}},[i._v("#")]),i._v(" Routing")]),i._v(" "),e("p",[i._v("In routing stage the routing definitions in configuration of every plugin are processed resulting in routes for later dispatch of request. Routes are read from configuration properties "),e("code",[i._v("routes")]),i._v(", "),e("code",[i._v("policies")]),i._v(" and "),e("code",[i._v("blueprints")]),i._v(".")]),i._v(" "),e("p",[i._v("After that application's configuration is processed accordingly for "),e("code",[i._v("routes")]),i._v(" and "),e("code",[i._v("policies")]),i._v(".")]),i._v(" "),e("p",[i._v("Routing definitions aren't replacing existing ones on match. For additional information on this rather complex method see the separate "),e("router-link",{attrs:{to:"/internals/routing-basics.html"}},[i._v("introduction on routing")]),i._v(".")],1),i._v(" "),e("p",[i._v("At the end of routing stage the application's bootstrap has finished.")]),i._v(" "),e("h2",{attrs:{id:"shutdown"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#shutdown","aria-hidden":"true"}},[i._v("#")]),i._v(" Shutdown")]),i._v(" "),e("p",[i._v("When gracefully shutting down a Hitchy-based application every plugin gets a chance to shutdown its previously initialised state. The same applies to the application which gets a chance to do so first.")]),i._v(" "),e("p",[i._v("On behalf of application a file named "),e("strong",[i._v("shutdown.js")]),i._v(" found in its project folder is loaded complying with common module pattern.")]),i._v(" "),e("p",[i._v("After that for every plugin is checked for exporting a method "),e("code",[i._v("shutdown()")]),i._v(" to be invoked now. Either function is invoked with "),e("code",[i._v("this")]),i._v(" referring to Hitchy's API and Hitchy options as well as either plugin's handle provided as arguments.")]),i._v(" "),e("div",{staticClass:"tip custom-block"},[e("p",{staticClass:"custom-block-title"},[i._v("Reversed Order")]),i._v(" "),e("p",[i._v("In opposition to any preceding stage plugins are processed in reversed order so that plugins having initialised their state first are requested to shut it down last.")])])])},[],!1,null,null,null);t.default=o.exports}}]);