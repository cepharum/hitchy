(window.webpackJsonp=window.webpackJsonp||[]).push([[11],{44:function(t,i,e){"use strict";e.r(i);var a=e(0),n=Object(a.a)({},function(){var t=this,i=t.$createElement,e=t._self._c||i;return e("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[e("h1",{attrs:{id:"integrating-plugins"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#integrating-plugins","aria-hidden":"true"}},[t._v("#")]),t._v(" Integrating Plugins")]),t._v(" "),e("p",[t._v("On startup Hitchy is discovering available plugins and integrating them with the application. This topic is providing a brief description of this so called "),e("em",[t._v("bootstrap operation")]),t._v(" which is divided into several "),e("router-link",{attrs:{to:"/internals/architecture-basics.html#discovering-plugins"}},[e("em",[t._v("bootstrap stages")])]),t._v(".")],1),t._v(" "),e("h2",{attrs:{id:"triangulation"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#triangulation","aria-hidden":"true"}},[t._v("#")]),t._v(" Triangulation")]),t._v(" "),e("p",[t._v("During triangulation phase there is no interaction with plugins for they haven't been discovered yet. It is mostly about Hitchy processing options customizing its behaviour and detecting an application's project folder as well its folder assumed to contain any available plugin.")]),t._v(" "),e("p",[t._v("In triangulation Hitchy is qualifying some of the supported "),e("router-link",{attrs:{to:"/api/#options"}},[t._v("options")]),t._v(". And it tries to find base folder of project to be managed by Hitchy unless it has been given on invocation explicitly.")],1),t._v(" "),e("div",{staticClass:"tip custom-block"},[e("p",{staticClass:"custom-block-title"},[t._v("Finding Application Folder")]),t._v(" "),e("p",[t._v("Unless providing application's project folder on invocation Hitchy is checking one of these supported use cases accepting the first one matching:")]),t._v(" "),e("ol",[e("li",[e("p",[t._v("Hitchy assumes current working directory is project folder of application to be managed. The folder is accepted when containing sub-folder named "),e("strong",[t._v("node_modules")]),t._v(". Otherwise parent folder of current working directory is tried. This process is repeated until either root folder of local file system has been reached or some folder containing "),e("strong",[t._v("node_modules")]),t._v(" has been found.")])]),t._v(" "),e("li",[e("p",[t._v("Hitchy assumes to be installed as a dependency of its application or some dependency of a dependency of its application etc. In this case it is starting at its own folder assumed to be contained in a "),e("strong",[t._v("node_modules")]),t._v(" folder itself, thus testing its grandparent folder.")])])])]),t._v(" "),e("h2",{attrs:{id:"discovery"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#discovery","aria-hidden":"true"}},[t._v("#")]),t._v(" Discovery")]),t._v(" "),e("div",{staticClass:"warning custom-block"},[e("p",{staticClass:"custom-block-title"},[t._v("Discovery Stage Is Crucial")]),t._v(" "),e("p",[t._v('This stage is very important for finding all available plugins and settle any "dispute" when multiple available plugins claiming to take same role in resulting application.')])]),t._v(" "),e("h3",{attrs:{id:"finding-plugins"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#finding-plugins","aria-hidden":"true"}},[t._v("#")]),t._v(" Finding Plugins")]),t._v(" "),e("p",[t._v("In discovery stage Hitchy is searching local filesystem for folders containing "),e("strong",[t._v("hitchy.json")]),t._v(" file. On every match the containing folder is considered an available Hitchy plugin. The "),e("strong",[t._v("hitchy.json")]),t._v(" file is read providing "),e("em",[t._v("static")]),t._v(" meta information on either plugin.")]),t._v(" "),e("div",{staticClass:"tip custom-block"},[e("p",{staticClass:"custom-block-title"},[t._v("Folders Searched For Plugins")]),t._v(" "),e("p",[t._v("By default, Hitchy is starting at application's folder. There it is deeply searching for any sub-folder in "),e("strong",[t._v("./node_modules")]),t._v(" containing a file named "),e("strong",[t._v("hitchy.json")]),t._v(". It is ignoring folders marked as hidden by name with leading period.")]),t._v(" "),e("p",[t._v("It is possible to explicitly select different folder to start from using option "),e("strong",[t._v("extensionFolder")]),t._v(".")]),t._v(" "),e("p",[t._v("Mostly for testing purposes it is possible provide a list of folders to be considered plugin folders explicitly using option "),e("strong",[t._v("explicitExtensions")]),t._v(". It is also possible to prevent Hitchy from searching folder mentioned before by setting option "),e("strong",[t._v("explicitFoldersOnly")]),t._v(". Neither option is supported by Hitchy's CLI script, though.")])]),t._v(" "),e("h3",{attrs:{id:"loading-plugins"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#loading-plugins","aria-hidden":"true"}},[t._v("#")]),t._v(" Loading Plugins")]),t._v(" "),e("p",[t._v("For every plugin its folder is loaded as a module using "),e("code",[t._v("require()")]),t._v(" while supporting compliance with "),e("router-link",{attrs:{to:"/api/#using-common-module-pattern"}},[t._v("common module pattern")]),t._v(". A plugin must provide an "),e("strong",[t._v("index.js")]),t._v(" file or "),e("a",{attrs:{href:"https://docs.npmjs.com/files/package.json#main",target:"_blank",rel:"noopener noreferrer"}},[t._v("select a different file"),e("OutboundLink")],1),t._v(" to be actually loaded.")],1),t._v(" "),e("p",[t._v("The loaded module is considered the plugin's API.")]),t._v(" "),e("p",[t._v("This API may include "),e("em",[t._v("dynamic")]),t._v(" meta information in its property "),e("code",[t._v("$meta")]),t._v(". It is basically used to extend the plugin's static meta information. This extended meta information is replacing API's property "),e("code",[t._v("$meta")]),t._v(" eventually.")]),t._v(" "),e("div",{staticClass:"warning custom-block"},[e("p",{staticClass:"custom-block-title"},[t._v("Risks")]),t._v(" "),e("p",[t._v("At this stage plugins are loaded in arbitrary order. Thus you can't rely on every other plugin's API being loaded already. You might need to cache available handle instead and wait for "),e("code",[t._v("onDiscovered()")]),t._v(" notification described below.")])]),t._v(" "),e("h3",{attrs:{id:"validating-claimed-roles"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#validating-claimed-roles","aria-hidden":"true"}},[t._v("#")]),t._v(" Validating Claimed Roles")]),t._v(" "),e("p",[t._v("Hitchy is passing additional information on loading a plugin which is complying with common module pattern. In addition to its highly rudimentary API provided as "),e("code",[t._v("this")]),t._v(" and its "),e("router-link",{attrs:{to:"/api/#options"}},[t._v("options")]),t._v(" provided in first argument it is passing")],1),t._v(" "),e("ul",[e("li",[t._v("a dictionary mapping every basically discovered plugin's name into either one's rudimentary "),e("a",{attrs:{href:"#a-plugin-s-handle"}},[t._v("handle")]),t._v(" in second argument and")]),t._v(" "),e("li",[t._v("notified plugin's own handle in third argument.")])]),t._v(" "),e("p",[t._v("Plugins may use this opportunity for dynamically claiming to take a role after inspecting available plugins. Whenever claiming to take a role dynamically every static claim for the same role is dropped probably resulting in plugins stripped off any role.")]),t._v(" "),e("div",{staticClass:"tip custom-block"},[e("p",{staticClass:"custom-block-title"},[t._v("Example")]),t._v(" "),e("p",[t._v("A plugin may be included to claim a role unless some other plugin is doing so. In this situation the former is meant to be a fallback for the latter.")]),t._v(" "),e("p",[t._v("In a different scenario a plugin might detect another plugin it basically depends on for deriving from its API. The former plugin would claim same role as the latter one. This dynamic claim to take a role is replacing any plugin's static claim for the same role.")])]),t._v(" "),e("h4",{attrs:{id:"a-plugin-s-handle"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#a-plugin-s-handle","aria-hidden":"true"}},[t._v("#")]),t._v(" A Plugin's Handle")]),t._v(" "),e("p",[t._v("Every plugin is exporting an API mostly used for integrating the plugin with a Hitchy-based application. It is thus essential in upcoming stages of bootstrap.")]),t._v(" "),e("p",[t._v("During bootstrap every discovered plugin is additionally represented by another object which is internally known as "),e("em",[t._v("the plugin's handle")]),t._v(". Every handle comes with these properties:")]),t._v(" "),e("ul",[e("li",[e("code",[t._v("handle.name")]),t._v(" is providing the plugin's name.")]),t._v(" "),e("li",[e("code",[t._v("handle.staticRole")]),t._v(" is providing the plugin's role claimed in its "),e("strong",[t._v("hitchy.json")]),t._v(" file.")]),t._v(" "),e("li",[e("code",[t._v("handle.folder")]),t._v(" is providing the folder the plugin has been loaded from.")]),t._v(" "),e("li",[e("code",[t._v("handle.meta")]),t._v(" is providing the plugin's loaded, merged and probably qualified meta information.")]),t._v(" "),e("li",[e("code",[t._v("handle.api")]),t._v(" is finally providing the API exported by the plugin.")]),t._v(" "),e("li",[e("code",[t._v("handle.config")]),t._v(" provides individual configuration of plugin read from its "),e("strong",[t._v("config")]),t._v(" folder in configuration stage.\n:::")])]),t._v(" "),e("h3",{attrs:{id:"notifying-plugins-on-discovery"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#notifying-plugins-on-discovery","aria-hidden":"true"}},[t._v("#")]),t._v(" Notifying Plugins on Discovery")]),t._v(" "),e("p",[t._v("Next, every plugin with an approved role which is exporting a method called "),e("code",[t._v("onDiscovered()")]),t._v(" as part of its API is notified on being discovered by invoking that function. This notification handler is invoked with "),e("code",[t._v("this")]),t._v(" referring to Hitchy's still rudimentary API. Arguments passed are")]),t._v(" "),e("ul",[e("li",[t._v("Hitchy options,")]),t._v(" "),e("li",[t._v("a dictionary mapping either discovered plugin's name into its "),e("a",{attrs:{href:"#a-plugins-handle"}},[t._v("handle")]),t._v(" and")]),t._v(" "),e("li",[t._v("the handle of current plugin exporting the function invoked.")])]),t._v(" "),e("p",[t._v("This notification is meant to indicate the moment when all plugins' handles have been populated with either plugin's API. At this point a plugin may rely on plugin handles it has cached before when replacing another plugin by dynamically claiming same role.")]),t._v(" "),e("div",{staticClass:"warning custom-block"},[e("p",{staticClass:"custom-block-title"},[t._v("Risks")]),t._v(" "),e("p",[t._v("Notifying plugins is still happening in arbitrary order here.")])]),t._v(" "),e("h3",{attrs:{id:"dropping-plugins"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#dropping-plugins","aria-hidden":"true"}},[t._v("#")]),t._v(" Dropping Plugins")]),t._v(" "),e("p",[t._v("Next, plugins with their static roles dropped as described before are dropped. They won't make it into Hitchy's API and thus won't be available at runtime directly, but still might be used internally by some of the other plugins.")]),t._v(" "),e("h3",{attrs:{id:"sorting-plugins"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#sorting-plugins","aria-hidden":"true"}},[t._v("#")]),t._v(" Sorting Plugins")]),t._v(" "),e("p",[t._v("For all leftover plugins a dependency graph is compiled. All plugins are sorted accordingly from plugin most other plugins rely on to those ones no other plugin relies on.")]),t._v(" "),e("div",{staticClass:"tip custom-block"},[e("p",[t._v("Any follow-up action regarding "),e("em",[t._v("every plugin")]),t._v(" is obeying this sorting order now. In shutdown stage as well as in handling late policies this order is reversed.")])]),t._v(" "),e("h2",{attrs:{id:"configuration"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#configuration","aria-hidden":"true"}},[t._v("#")]),t._v(" Configuration")]),t._v(" "),e("p",[t._v("In configuration stage the application's configuration is compiled from every plugin and the application itself.")]),t._v(" "),e("h3",{attrs:{id:"collecting-compiling"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#collecting-compiling","aria-hidden":"true"}},[t._v("#")]),t._v(" Collecting & Compiling")]),t._v(" "),e("p",[t._v("Every plugin as well as the application is assumed to provide zero or more non-hidden configuration files implemented as Javascript modules in sub-folder "),e("strong",[t._v("config")]),t._v(". Every file in that sub-folder that does not start with a full stop "),e("code",[t._v(".")]),t._v(" and ends with "),e("strong",[t._v(".js")]),t._v(" is assumed to export another part of eventual configuration.")]),t._v(" "),e("p",[t._v("Hitchy is reading all those files merging them into a single configuration object which is exposed as part of Hitchy's API at "),e("code",[t._v("api.runtime.config")]),t._v(".")]),t._v(" "),e("div",{staticClass:"tip custom-block"},[e("p",{staticClass:"custom-block-title"},[t._v("Special Case: local.js")]),t._v(" "),e("p",[t._v("Every plugin as well as the application may use a file "),e("strong",[t._v("config/local.js")]),t._v(" which is always processed after having processed all the other configuration files in a folder. This helps with safely declaring defaults prior to providing a custom configuration for the current installation which might be deviating from those defaults.")])]),t._v(" "),e("h3",{attrs:{id:"final-notification"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#final-notification","aria-hidden":"true"}},[t._v("#")]),t._v(" Final Notification")]),t._v(" "),e("p",[t._v("After having compiled this object every plugin is notified by invoking method "),e("code",[t._v("configure()")]),t._v(" optionally available in either plugin's API. The function is invoked with "),e("code",[t._v("this")]),t._v(" referring to Hitchy's partially compiled API and Hitchy options as well as the notified plugin's handle as arguments.")]),t._v(" "),e("h2",{attrs:{id:"exposure"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#exposure","aria-hidden":"true"}},[t._v("#")]),t._v(" Exposure")]),t._v(" "),e("p",[t._v("Exposure stage is meant to compile components listed in section "),e("code",[t._v("api.runtime")]),t._v(" of Hitchy's API.")]),t._v(" "),e("h3",{attrs:{id:"early-notification"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#early-notification","aria-hidden":"true"}},[t._v("#")]),t._v(" Early Notification")]),t._v(" "),e("p",[t._v("This stage starts with a notification called "),e("code",[t._v("onExposing()")]),t._v(". This notification is useful for accessing final configuration for the first time.")]),t._v(" "),e("p",[t._v("Every interested plugin must export a method called "),e("code",[t._v("onExposing()")]),t._v(" in its API. Just like before, the function is invoked with "),e("code",[t._v("this")]),t._v(" referring to still partial Hitchy API and Hitchy options as well as the notified plugin's handle as arguments.")]),t._v(" "),e("h3",{attrs:{id:"collecting-deriving-replacing"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#collecting-deriving-replacing","aria-hidden":"true"}},[t._v("#")]),t._v(" Collecting, Deriving, Replacing")]),t._v(" "),e("p",[t._v("Components of every plugin are processed before processing components of application.")]),t._v(" "),e("p",[t._v("In either case components are processed "),e("router-link",{attrs:{to:"/internals/architecture-basics.html#components"}},[t._v("type")]),t._v(" by type. For every component another Javascript file is expected in either type of component's sub-folder "),e("strong",[t._v("api/controllers")]),t._v(", "),e("strong",[t._v("api/policies")]),t._v(" etc.")],1),t._v(" "),e("div",{staticClass:"tip custom-block"},[e("p",[t._v("Starting with v0.3.3 Hitchy is deeply searching in either folder. "),e("router-link",{attrs:{to:"/api/#config-hitchy-deepcomponents-0-3-3"}},[t._v("Configuration")]),t._v(" is read to keep the previous behaviour.")],1)]),t._v(" "),e("p",[t._v("Every found Javascript file is loaded to export the component's API. This might be any kind of data. Usually, it is a class or an object of functions. It is exposed as part of "),e("router-link",{attrs:{to:"/api/#api-runtime"}},[t._v("Hitchy's API")]),t._v(" at runtime using a "),e("router-link",{attrs:{to:"/internals/components.html#derivation-of-component-names"}},[t._v("name that is derived from found file's name")]),t._v(".")],1),t._v(" "),e("p",[t._v("Either component's module may comply with "),e("router-link",{attrs:{to:"/api/#using-common-module-pattern"}},[t._v("common module pattern")]),t._v(". In this case the exported  function is invoked with "),e("code",[t._v("this")]),t._v(" referring to Hitchy's API in its current state and Hitchy's options in first argument as usual. In addition, however, some existing component of same name to be replaced by loaded one is passed in second argument so the new component is capable of deriving from that existing one.")],1),t._v(" "),e("div",{staticClass:"tip custom-block"},[e("p",{staticClass:"custom-block-title"},[t._v("Example")]),t._v(" "),e("p",[t._v("Assume some plugin is providing same service module as another plugin it depends on. The module could look like this:")]),t._v(" "),e("p",[e("strong",[t._v("api/service/crypto.js:")])]),t._v(" "),e("div",{staticClass:"language-javascript extra-class"},[e("pre",{pre:!0,attrs:{class:"language-javascript"}},[e("code",[t._v("module"),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),e("span",{pre:!0,attrs:{class:"token function-variable function"}},[t._v("exports")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("function")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token parameter"}},[t._v("options"),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" ExistingCryptoService")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),e("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("return")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("class")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("RevisedCryptoService")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("extends")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("ExistingCryptoService")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n        "),e("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// TODO provide some implementation here")]),t._v("\n    "),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n")])])])]),t._v(" "),e("h3",{attrs:{id:"final-notification-2"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#final-notification-2","aria-hidden":"true"}},[t._v("#")]),t._v(" Final Notification")]),t._v(" "),e("p",[t._v("Just like in previous stages a notification is dispatched by invoking method "),e("code",[t._v("onExposed()")]),t._v(" for every plugin that's exporting this function as part of its API. Its signature is equivalent to that one of "),e("code",[t._v("onExposing()")]),t._v(" described before.")]),t._v(" "),e("h2",{attrs:{id:"initialisation"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#initialisation","aria-hidden":"true"}},[t._v("#")]),t._v(" Initialisation")]),t._v(" "),e("p",[t._v("In initialisation stage configuration and all components are available. Every plugin gets opportunity to initialise its state for runtime, e.g. by establishing connections to databases or similar.")]),t._v(" "),e("div",{staticClass:"tip custom-block"},[e("p",[e("a",{attrs:{href:"#shutdown"}},[t._v("Shutdown stage")]),t._v(" is supported as a counterpart to this stage.")])]),t._v(" "),e("h3",{attrs:{id:"initialising-plugins"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#initialising-plugins","aria-hidden":"true"}},[t._v("#")]),t._v(" Initialising Plugins")]),t._v(" "),e("p",[t._v("For every plugin a method "),e("code",[t._v("initialize()")]),t._v(" exported as part of its API is invoked. The function is invoked with "),e("code",[t._v("this")]),t._v(" referring to Hitchy's API and Hitchy options as well as either plugin's handle provided as arguments.")]),t._v(" "),e("h3",{attrs:{id:"initialising-application"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#initialising-application","aria-hidden":"true"}},[t._v("#")]),t._v(" Initialising Application")]),t._v(" "),e("p",[t._v("Application may provide its initialisation code to be invoked after having initialised all plugins. Applications requiring special setup provide a file named "),e("strong",[t._v("initialize.js")]),t._v(" in project folder. This file is invoked in compliance with common module pattern.")]),t._v(" "),e("p",[e("strong",[t._v("app/initialize.js")])]),t._v(" "),e("div",{staticClass:"language-javascript extra-class"},[e("pre",{pre:!0,attrs:{class:"language-javascript"}},[e("code",[t._v("module"),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),e("span",{pre:!0,attrs:{class:"token function-variable function"}},[t._v("exports")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("function")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token parameter"}},[t._v("options")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),e("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" api "),e("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("this")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n    "),e("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// TODO implement your application here, e.g. by setting up caches or similar")]),t._v("\n"),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n")])])]),e("h2",{attrs:{id:"routing"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#routing","aria-hidden":"true"}},[t._v("#")]),t._v(" Routing")]),t._v(" "),e("div",{staticClass:"tip custom-block"},[e("p",{staticClass:"custom-block-title"},[t._v("Dedicated Stage For Routing")]),t._v(" "),e("p",[t._v("Routing stage is a dedicated stage at end of bootstrap so it is capable of using APIs, components and configuration of existing plugins and the application for eventually declaring routes.")])]),t._v(" "),e("p",[t._v("In routing stage every plugin is asked to provide its routing declarations in one of two ways:")]),t._v(" "),e("ol",[e("li",[e("p",[t._v("Using configuration files just like the application either plugin can declare routing of "),e("router-link",{attrs:{to:"/internals/routing-basics.html#policies"}},[e("code",[t._v("policies")])]),t._v(", (terminal) "),e("router-link",{attrs:{to:"/internals/routing-basics.html#routes"}},[e("code",[t._v("routes")])]),t._v(" and "),e("router-link",{attrs:{to:"/internals/routing-basics.html#focusing-on-routes"}},[e("code",[t._v("blueprints")])]),t._v(".")],1),t._v(" "),e("p",[t._v("Those routings will be part of global configuration object exposed via Hitchy's API at runtime, as well. But either plugin's configuration as well as the routing configuration of application is processed independently.")]),t._v(" "),e("div",{staticClass:"warning custom-block"},[e("p",[t._v("This option has been introduced in v0.3.6.")])])]),t._v(" "),e("li",[e("p",[t._v("The preferred way is to expose either set of declarations as part of a "),e("router-link",{attrs:{to:"/api/plugins.html#common-plugin-api"}},[t._v("plugin's API")]),t._v(". "),e("code",[t._v("policies")]),t._v(", "),e("code",[t._v("routes")]),t._v(" and/or "),e("code",[t._v("blueprints")]),t._v(" can be exposed as object containing declarations or as function to be invoked in compliance with common module (function) pattern to return either set of declarations there.")],1),t._v(" "),e("div",{staticClass:"tip custom-block"},[e("p",{staticClass:"custom-block-title"},[t._v("Hidden Routings")]),t._v(" "),e("p",[t._v("This approach is preferred to prevent useless pollution of "),e("router-link",{attrs:{to:"/api/#configuration"}},[t._v("configuration object")]),t._v(".")],1)])])]),t._v(" "),e("p",[t._v("After that application's configuration is processed accordingly for "),e("code",[t._v("routes")]),t._v(" and "),e("code",[t._v("policies")]),t._v(".")]),t._v(" "),e("p",[t._v("Routing declarations aren't replacing existing ones on match, but might cause some declarations inferior to others to be dropped when optimising routing tables. For additional information on this rather complex method see the separate "),e("router-link",{attrs:{to:"/internals/routing-basics.html"}},[t._v("introduction on routing")]),t._v(".")],1),t._v(" "),e("p",[t._v("At the end of routing stage the application's bootstrap has finished.")]),t._v(" "),e("h2",{attrs:{id:"shutdown"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#shutdown","aria-hidden":"true"}},[t._v("#")]),t._v(" Shutdown")]),t._v(" "),e("p",[t._v("When gracefully shutting down a Hitchy-based application every plugin gets a chance to shutdown its previously initialised state. The same applies to the application which gets a chance to do so first.")]),t._v(" "),e("h3",{attrs:{id:"shutting-down-application"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#shutting-down-application","aria-hidden":"true"}},[t._v("#")]),t._v(" Shutting Down Application")]),t._v(" "),e("p",[t._v("On behalf of application a file named "),e("strong",[t._v("shutdown.js")]),t._v(" found in its project folder is loaded complying with common module pattern.")]),t._v(" "),e("p",[e("strong",[t._v("app/shutdown.js")])]),t._v(" "),e("div",{staticClass:"language-javascript extra-class"},[e("pre",{pre:!0,attrs:{class:"language-javascript"}},[e("code",[t._v("module"),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),e("span",{pre:!0,attrs:{class:"token function-variable function"}},[t._v("exports")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("function")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token parameter"}},[t._v("options")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),e("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" api "),e("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("this")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n    "),e("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// TODO remove caching files of your application or similar here")]),t._v("\n"),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n")])])]),e("h3",{attrs:{id:"shutting-down-plugins"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#shutting-down-plugins","aria-hidden":"true"}},[t._v("#")]),t._v(" Shutting Down Plugins")]),t._v(" "),e("p",[t._v("After that for every plugin is checked for exporting a method "),e("code",[t._v("shutdown()")]),t._v(" to be invoked now. Either function is invoked with "),e("code",[t._v("this")]),t._v(" referring to Hitchy's API and Hitchy options as well as either plugin's handle provided as arguments.")]),t._v(" "),e("div",{staticClass:"tip custom-block"},[e("p",{staticClass:"custom-block-title"},[t._v("Reversed Order")]),t._v(" "),e("p",[t._v("In opposition to any preceding stage plugins are processed in reversed order so that plugins having initialised their state first are requested to shut it down last.")])])])},[],!1,null,null,null);i.default=n.exports}}]);