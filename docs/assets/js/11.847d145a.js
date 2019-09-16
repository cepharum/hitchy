(window.webpackJsonp=window.webpackJsonp||[]).push([[11],{44:function(i,t,e){"use strict";e.r(t);var n=e(0),a=Object(n.a)({},function(){var i=this,t=i.$createElement,e=i._self._c||t;return e("ContentSlotsDistributor",{attrs:{"slot-key":i.$parent.slotKey}},[e("h1",{attrs:{id:"integrating-plugins"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#integrating-plugins","aria-hidden":"true"}},[i._v("#")]),i._v(" Integrating Plugins")]),i._v(" "),e("p",[i._v("This topic is providing a brief description of Hitchy's bootstrap operation which is mostly for discovering and integrating available plugins.")]),i._v(" "),e("p",[i._v("On startup Hitchy is discovering available plugins and integrating them with the application. This process is divided into several so called "),e("router-link",{attrs:{to:"/internals/architecture-basics.html#discovering-plugins"}},[e("em",[i._v("bootstrap stages")])]),i._v(".")],1),i._v(" "),e("h2",{attrs:{id:"triangulation"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#triangulation","aria-hidden":"true"}},[i._v("#")]),i._v(" Triangulation")]),i._v(" "),e("p",[i._v("During triangulation phase there is no interaction with plugins for they haven't been discovered yet. It is mostly about Hitchy processing options customizing its behaviour and detecting an application's project folder as well its folder assumed to contain any available plugin.")]),i._v(" "),e("p",[i._v("In triangulation Hitchy is qualifying some of the supported "),e("router-link",{attrs:{to:"/api/#options"}},[i._v("options")]),i._v(". And it tries to find base folder of project to be managed by Hitchy unless it has been given on invocation explicitly.")],1),i._v(" "),e("div",{staticClass:"tip custom-block"},[e("p",{staticClass:"custom-block-title"},[i._v("Finding Application Folder")]),i._v(" "),e("p",[i._v("Unless providing application's project folder on invocation Hitchy is checking one of these supported use cases accepting the first one matching:")]),i._v(" "),e("ol",[e("li",[e("p",[i._v("Hitchy assumes current working directory is project folder of application to be managed. The folder is accepted when containing sub-folder named "),e("strong",[i._v("node_modules")]),i._v(". Otherwise parent folder of current working directory is tried. This process is repeated until either root folder of local file system has been reached or some folder containing "),e("strong",[i._v("node_modules")]),i._v(" has been found.")])]),i._v(" "),e("li",[e("p",[i._v("Hitchy assumes to be installed as a dependency of its application or some dependency of a dependency of its application etc. In this case it is starting at its own folder assumed to be contained in a "),e("strong",[i._v("node_modules")]),i._v(" folder itself, thus testing its grandparent folder.")])])])]),i._v(" "),e("h2",{attrs:{id:"discovery"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#discovery","aria-hidden":"true"}},[i._v("#")]),i._v(" Discovery")]),i._v(" "),e("div",{staticClass:"warning custom-block"},[e("p",{staticClass:"custom-block-title"},[i._v("Discovery Stage Is Crucial")]),i._v(" "),e("p",[i._v('This stage is very important for finding all available plugins and settle any "dispute" when multiple available plugins claiming to take same role in resulting application.')])]),i._v(" "),e("h3",{attrs:{id:"finding-plugins"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#finding-plugins","aria-hidden":"true"}},[i._v("#")]),i._v(" Finding Plugins")]),i._v(" "),e("p",[i._v("In discovery stage Hitchy is searching local filesystem for folders containing "),e("strong",[i._v("hitchy.json")]),i._v(" file. On every match the containing folder is considered an available Hitchy plugin. The "),e("strong",[i._v("hitchy.json")]),i._v(" file is read providing "),e("em",[i._v("static")]),i._v(" meta information on either plugin.")]),i._v(" "),e("div",{staticClass:"tip custom-block"},[e("p",{staticClass:"custom-block-title"},[i._v("Folders Searched For Plugins")]),i._v(" "),e("p",[i._v("By default, Hitchy is starting at application's folder. There it is deeply searching for any sub-folder in "),e("strong",[i._v("./node_modules")]),i._v(" containing a file named "),e("strong",[i._v("hitchy.json")]),i._v(". It is ignoring folders marked as hidden by name with leading period.")]),i._v(" "),e("p",[i._v("It is possible to explicitly select different folder to start from using option "),e("strong",[i._v("extensionFolder")]),i._v(".")]),i._v(" "),e("p",[i._v("Mostly for testing purposes it is possible provide a list of folders to be considered plugin folders explicitly using option "),e("strong",[i._v("explicitExtensions")]),i._v(". It is also possible to prevent Hitchy from searching folder mentioned before by setting option "),e("strong",[i._v("explicitFoldersOnly")]),i._v(". Neither option is supported by Hitchy's CLI script, though.")])]),i._v(" "),e("h3",{attrs:{id:"loading-plugins"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#loading-plugins","aria-hidden":"true"}},[i._v("#")]),i._v(" Loading Plugins")]),i._v(" "),e("p",[i._v("For every plugin its folder is loaded as a module using "),e("code",[i._v("require()")]),i._v(" while supporting compliance with "),e("router-link",{attrs:{to:"/api/#using-common-module-pattern"}},[i._v("common module pattern")]),i._v(". A plugin must provide an "),e("strong",[i._v("index.js")]),i._v(" file or "),e("a",{attrs:{href:"https://docs.npmjs.com/files/package.json#main",target:"_blank",rel:"noopener noreferrer"}},[i._v("select a different file"),e("OutboundLink")],1),i._v(" to be actually loaded.")],1),i._v(" "),e("p",[i._v("The loaded module is considered the plugin's API.")]),i._v(" "),e("p",[i._v("This API may include "),e("em",[i._v("dynamic")]),i._v(" meta information in its property "),e("code",[i._v("$meta")]),i._v(". It is basically used to extend the plugin's static meta information. This extended meta information is replacing API's property "),e("code",[i._v("$meta")]),i._v(" eventually.")]),i._v(" "),e("div",{staticClass:"warning custom-block"},[e("p",{staticClass:"custom-block-title"},[i._v("Risks")]),i._v(" "),e("p",[i._v("At this stage plugins are loaded in arbitrary order. Thus you can't rely on every other plugin's API being loaded already. You might need to cache available handle instead and wait for "),e("code",[i._v("onDiscovered()")]),i._v(" notification described below.")])]),i._v(" "),e("h3",{attrs:{id:"validating-claimed-roles"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#validating-claimed-roles","aria-hidden":"true"}},[i._v("#")]),i._v(" Validating Claimed Roles")]),i._v(" "),e("p",[i._v("Hitchy is passing additional information on loading a plugin which is complying with common module pattern. In addition to its highly rudimentary API provided as "),e("code",[i._v("this")]),i._v(" and its "),e("router-link",{attrs:{to:"/api/#options"}},[i._v("options")]),i._v(" provided in first argument it is passing")],1),i._v(" "),e("ul",[e("li",[i._v("a dictionary mapping every basically discovered plugin's name into either one's rudimentary "),e("a",{attrs:{href:"#a-plugin-s-handle"}},[i._v("handle")]),i._v(" in second argument and")]),i._v(" "),e("li",[i._v("notified plugin's own handle in third argument.")])]),i._v(" "),e("p",[i._v("Plugins may use this opportunity for dynamically claiming to take a role after inspecting available plugins. Whenever claiming to take a role dynamically every static claim for the same role is dropped probably resulting in plugins stripped off any role.")]),i._v(" "),e("div",{staticClass:"tip custom-block"},[e("p",{staticClass:"custom-block-title"},[i._v("Example")]),i._v(" "),e("p",[i._v("A plugin may be included to claim a role unless some other plugin is doing so. In this situation the former is meant to be a fallback for the latter.")]),i._v(" "),e("p",[i._v("In a different scenario a plugin might detect another plugin it basically depends on for deriving from its API. The former plugin would claim same role as the latter one. This dynamic claim to take a role is replacing any plugin's static claim for the same role.")])]),i._v(" "),e("h4",{attrs:{id:"a-plugin-s-handle"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#a-plugin-s-handle","aria-hidden":"true"}},[i._v("#")]),i._v(" A Plugin's Handle")]),i._v(" "),e("p",[i._v("Every plugin is exporting an API mostly used for integrating the plugin with a Hitchy-based application. It is thus essential in upcoming stages of bootstrap.")]),i._v(" "),e("p",[i._v("During bootstrap every discovered plugin is additionally represented by another object which is internally known as "),e("em",[i._v("the plugin's handle")]),i._v(". Every handle comes with these properties:")]),i._v(" "),e("ul",[e("li",[e("code",[i._v("handle.name")]),i._v(" is providing the plugin's name.")]),i._v(" "),e("li",[e("code",[i._v("handle.staticRole")]),i._v(" is providing the plugin's role claimed in its "),e("strong",[i._v("hitchy.json")]),i._v(" file.")]),i._v(" "),e("li",[e("code",[i._v("handle.folder")]),i._v(" is providing the folder the plugin has been loaded from.")]),i._v(" "),e("li",[e("code",[i._v("handle.meta")]),i._v(" is providing the plugin's loaded, merged and probably qualified meta information.")]),i._v(" "),e("li",[e("code",[i._v("handle.api")]),i._v(" is finally providing the API exported by the plugin.\n:::")])]),i._v(" "),e("h3",{attrs:{id:"notifying-plugins-on-discovery"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#notifying-plugins-on-discovery","aria-hidden":"true"}},[i._v("#")]),i._v(" Notifying Plugins on Discovery")]),i._v(" "),e("p",[i._v("Next, every plugin with an approved role which is exporting a method called "),e("code",[i._v("onDiscovered()")]),i._v(" as part of its API is notified on being discovered by invoking that function. This notification handler is invoked with "),e("code",[i._v("this")]),i._v(" referring to Hitchy's still rudimentary API. Arguments passed are")]),i._v(" "),e("ul",[e("li",[i._v("Hitchy options,")]),i._v(" "),e("li",[i._v("a dictionary mapping either discovered plugin's name into its "),e("a",{attrs:{href:"#a-plugins-handle"}},[i._v("handle")]),i._v(" and")]),i._v(" "),e("li",[i._v("the handle of current plugin exporting the function invoked.")])]),i._v(" "),e("p",[i._v("This notification is meant to indicate the moment when all plugins' handles have been populated with either plugin's API. At this point a plugin may rely on plugin handles it has cached before when replacing another plugin by dynamically claiming same role.")]),i._v(" "),e("div",{staticClass:"warning custom-block"},[e("p",{staticClass:"custom-block-title"},[i._v("Risks")]),i._v(" "),e("p",[i._v("Notifying plugins is still happening in arbitrary order here.")])]),i._v(" "),e("h3",{attrs:{id:"dropping-plugins"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#dropping-plugins","aria-hidden":"true"}},[i._v("#")]),i._v(" Dropping Plugins")]),i._v(" "),e("p",[i._v("Next, plugins with their static roles dropped as described before are dropped. They won't make it into Hitchy's API and thus won't be available at runtime directly, but still might be used internally by some of the other plugins.")]),i._v(" "),e("h3",{attrs:{id:"sorting-plugins"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#sorting-plugins","aria-hidden":"true"}},[i._v("#")]),i._v(" Sorting Plugins")]),i._v(" "),e("p",[i._v("For all leftover plugins a dependency graph is compiled. All plugins are sorted accordingly from plugin most other plugins rely on to those ones no other plugin relies on.")]),i._v(" "),e("div",{staticClass:"tip custom-block"},[e("p",[i._v("Any follow-up action regarding "),e("em",[i._v("every plugin")]),i._v(" is obeying this sorting order now. In shutdown stage as well as in handling late policies this order is reversed.")])]),i._v(" "),e("h2",{attrs:{id:"configuration"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#configuration","aria-hidden":"true"}},[i._v("#")]),i._v(" Configuration")]),i._v(" "),e("p",[i._v("In configuration stage the application's configuration is compiled from every plugin and the application itself.")]),i._v(" "),e("h3",{attrs:{id:"collecting-compiling"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#collecting-compiling","aria-hidden":"true"}},[i._v("#")]),i._v(" Collecting & Compiling")]),i._v(" "),e("p",[i._v("Every plugin as well as the application is assumed to provide zero or more non-hidden configuration files implemented as Javascript modules in sub-folder "),e("strong",[i._v("config")]),i._v(". Every file in that sub-folder that does not start with a full stop "),e("code",[i._v(".")]),i._v(" and ends with "),e("strong",[i._v(".js")]),i._v(" is assumed to export another part of eventual configuration.")]),i._v(" "),e("p",[i._v("Hitchy is reading all those files merging them into a single configuration object which is exposed as part of Hitchy's API at "),e("code",[i._v("api.runtime.config")]),i._v(".")]),i._v(" "),e("div",{staticClass:"tip custom-block"},[e("p",{staticClass:"custom-block-title"},[i._v("Special Case: local.js")]),i._v(" "),e("p",[i._v("Every plugin as well as the application may use a file "),e("strong",[i._v("config/local.js")]),i._v(" which is always processed after having processed all the other configuration files in a folder. This helps with safely declaring defaults prior to providing a custom configuration for the current installation which might be deviating from those defaults.")])]),i._v(" "),e("h3",{attrs:{id:"final-notification"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#final-notification","aria-hidden":"true"}},[i._v("#")]),i._v(" Final Notification")]),i._v(" "),e("p",[i._v("After having compiled this object every plugin is notified by invoking method "),e("code",[i._v("configure()")]),i._v(" optionally available in either plugin's API. The function is invoked with "),e("code",[i._v("this")]),i._v(" referring to Hitchy's partially compiled API and Hitchy options as well as the notified plugin's handle as arguments.")]),i._v(" "),e("h2",{attrs:{id:"exposure"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#exposure","aria-hidden":"true"}},[i._v("#")]),i._v(" Exposure")]),i._v(" "),e("p",[i._v("Exposure stage is meant to compile components listed in section "),e("code",[i._v("api.runtime")]),i._v(" of Hitchy's API.")]),i._v(" "),e("h3",{attrs:{id:"early-notification"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#early-notification","aria-hidden":"true"}},[i._v("#")]),i._v(" Early Notification")]),i._v(" "),e("p",[i._v("This stage starts with a notification called "),e("code",[i._v("onExposing()")]),i._v(". This notification is useful for accessing final configuration for the first time.")]),i._v(" "),e("p",[i._v("Every interested plugin must export a method called "),e("code",[i._v("onExposing()")]),i._v(" in its API. Just like before, the function is invoked with "),e("code",[i._v("this")]),i._v(" referring to still partial Hitchy API and Hitchy options as well as the notified plugin's handle as arguments.")]),i._v(" "),e("h3",{attrs:{id:"collecting-deriving-replacing"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#collecting-deriving-replacing","aria-hidden":"true"}},[i._v("#")]),i._v(" Collecting, Deriving, Replacing")]),i._v(" "),e("p",[i._v("After that, components of every plugin are loaded prior to loading those provided by current application.")]),i._v(" "),e("p",[i._v("Whenever a component complies with common module pattern the module function is invoked with "),e("code",[i._v("this")]),i._v(" referring to Hitchy's API in its current state and Hitchy's options in first argument. In addition some existing component of same name to be replaced by loaded one is passed in second argument so the new component is capable of deriving from that existing one.")]),i._v(" "),e("div",{staticClass:"tip custom-block"},[e("p",{staticClass:"custom-block-title"},[i._v("Example")]),i._v(" "),e("p",[i._v("Assume some plugin is providing same service module as another plugin it depends on. The module could look like this:")]),i._v(" "),e("p",[e("strong",[i._v("api/service/crypto.js:")])]),i._v(" "),e("div",{staticClass:"language-javascript extra-class"},[e("pre",{pre:!0,attrs:{class:"language-javascript"}},[e("code",[i._v("module"),e("span",{pre:!0,attrs:{class:"token punctuation"}},[i._v(".")]),e("span",{pre:!0,attrs:{class:"token function-variable function"}},[i._v("exports")]),i._v(" "),e("span",{pre:!0,attrs:{class:"token operator"}},[i._v("=")]),i._v(" "),e("span",{pre:!0,attrs:{class:"token keyword"}},[i._v("function")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[i._v("(")]),i._v(" "),e("span",{pre:!0,attrs:{class:"token parameter"}},[i._v("options"),e("span",{pre:!0,attrs:{class:"token punctuation"}},[i._v(",")]),i._v(" ExistingCryptoService")]),i._v(" "),e("span",{pre:!0,attrs:{class:"token punctuation"}},[i._v(")")]),i._v(" "),e("span",{pre:!0,attrs:{class:"token punctuation"}},[i._v("{")]),i._v("\n    "),e("span",{pre:!0,attrs:{class:"token keyword"}},[i._v("return")]),i._v(" "),e("span",{pre:!0,attrs:{class:"token keyword"}},[i._v("class")]),i._v(" "),e("span",{pre:!0,attrs:{class:"token class-name"}},[i._v("RevisedCryptoService")]),i._v(" "),e("span",{pre:!0,attrs:{class:"token keyword"}},[i._v("extends")]),i._v(" "),e("span",{pre:!0,attrs:{class:"token class-name"}},[i._v("ExistingCryptoService")]),i._v(" "),e("span",{pre:!0,attrs:{class:"token punctuation"}},[i._v("{")]),i._v("\n        "),e("span",{pre:!0,attrs:{class:"token comment"}},[i._v("// TODO provide some implementation here")]),i._v("\n    "),e("span",{pre:!0,attrs:{class:"token punctuation"}},[i._v("}")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[i._v(";")]),i._v("\n"),e("span",{pre:!0,attrs:{class:"token punctuation"}},[i._v("}")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[i._v(";")]),i._v("\n")])])])]),i._v(" "),e("h3",{attrs:{id:"final-notification-2"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#final-notification-2","aria-hidden":"true"}},[i._v("#")]),i._v(" Final Notification")]),i._v(" "),e("p",[i._v("Just like in previous stages a notification is dispatched by invoking method "),e("code",[i._v("onExposed()")]),i._v(" for every plugin that's exporting this function as part of its API. Its signature is equivalent to that one of "),e("code",[i._v("onExposing()")]),i._v(" described before.")]),i._v(" "),e("h2",{attrs:{id:"initialisation"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#initialisation","aria-hidden":"true"}},[i._v("#")]),i._v(" Initialisation")]),i._v(" "),e("p",[i._v("In initialisation stage configuration and all components are available. Every plugin gets opportunity to initialise its state for runtime, e.g. by establishing connections to databases or similar.")]),i._v(" "),e("div",{staticClass:"tip custom-block"},[e("p",[e("a",{attrs:{href:"#shutdown"}},[i._v("Shutdown stage")]),i._v(" is supported as a counterpart to this stage.")])]),i._v(" "),e("p",[i._v("For every plugin a method "),e("code",[i._v("initialize()")]),i._v(" exported as part of its API is invoked. The function is invoked with "),e("code",[i._v("this")]),i._v(" referring to Hitchy's API and Hitchy options as well as either plugin's handle provided as arguments.")]),i._v(" "),e("p",[i._v("Application may provide its initialisation code to be invoked after having initialised all plugins. Applications requiring special setup provide a file named "),e("strong",[i._v("initialize.js")]),i._v(" in project folder. This file is invoked in compliance with common module pattern.")]),i._v(" "),e("h2",{attrs:{id:"routing"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#routing","aria-hidden":"true"}},[i._v("#")]),i._v(" Routing")]),i._v(" "),e("div",{staticClass:"tip custom-block"},[e("p",{staticClass:"custom-block-title"},[i._v("Dedicated Stage For Routing")]),i._v(" "),e("p",[i._v("Routing stage is a dedicated stage at end of bootstrap so it is capable of using APIs, components and configuration of existing plugins and the application for eventually declaring routes.")])]),i._v(" "),e("p",[i._v("In routing stage the routing definitions in configuration of every plugin are processed resulting in routes for later dispatch of request. Routes are read from configuration properties "),e("code",[i._v("routes")]),i._v(", "),e("code",[i._v("policies")]),i._v(" and "),e("code",[i._v("blueprints")]),i._v(".")]),i._v(" "),e("p",[i._v("After that application's configuration is processed accordingly for "),e("code",[i._v("routes")]),i._v(" and "),e("code",[i._v("policies")]),i._v(".")]),i._v(" "),e("p",[i._v("Routing definitions aren't replacing existing ones on match. For additional information on this rather complex method see the separate "),e("router-link",{attrs:{to:"/internals/routing-basics.html"}},[i._v("introduction on routing")]),i._v(".")],1),i._v(" "),e("p",[i._v("At the end of routing stage the application's bootstrap has finished.")]),i._v(" "),e("h2",{attrs:{id:"shutdown"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#shutdown","aria-hidden":"true"}},[i._v("#")]),i._v(" Shutdown")]),i._v(" "),e("p",[i._v("When gracefully shutting down a Hitchy-based application every plugin gets a chance to shutdown its previously initialised state. The same applies to the application which gets a chance to do so first.")]),i._v(" "),e("p",[i._v("On behalf of application a file named "),e("strong",[i._v("shutdown.js")]),i._v(" found in its project folder is loaded complying with common module pattern.")]),i._v(" "),e("p",[i._v("After that for every plugin is checked for exporting a method "),e("code",[i._v("shutdown()")]),i._v(" to be invoked now. Either function is invoked with "),e("code",[i._v("this")]),i._v(" referring to Hitchy's API and Hitchy options as well as either plugin's handle provided as arguments.")]),i._v(" "),e("div",{staticClass:"tip custom-block"},[e("p",{staticClass:"custom-block-title"},[i._v("Reversed Order")]),i._v(" "),e("p",[i._v("In opposition to any preceding stage plugins are processed in reversed order so that plugins having initialised their state first are requested to shut it down last.")])])])},[],!1,null,null,null);t.default=a.exports}}]);