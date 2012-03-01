Require plugin for jQuery
========================

Yet another module-management system for jQuery.

Demo
----

[Examples](https://github.com/pozs/jQuery-require/tree/master/examples "Examples")

Example Usage
-------------

```js
// Synchronous load

var plugin  = $.require( "plugin" ),
    plugins = $.require( "plugin1", "plugin2" ),
    plugin1 = plugins[0],
    plugin2 = plugins[1];

// Asynchronous load

$.require( "ui", function ( ui ) {
  console.assert( ui === $.ui );
} );

// Module-versioning support

$.require( "ui@1.8.2", function ( ui ) {
  console.assert( ui === $.ui );
} );

$.require( "ui.button", function ( button ) {
  console.assert( button === $.ui.button );
} );

$.require( "ui.button", "ui.dialog", function ( button, dialog ) {
  console.assert( button === $.ui.button );
  console.assert( dialog === $.ui.dialog );
} );

// Asynchronous load (using deferred)

$.require( "plugin1", "plugin2", true ).
  then( function ( plugin1, plugin2 ) {
    // use plugins
  } );

$.require( "plugin1", "plugin2", function ( plugin1, plugin2 ) {
  // use plugin1 f.ex.
} ).then( function ( plugin1, plugin2 ) {
  // use plugin2 f.ex.
} );
```

Features
--------

*   configurable load-adapters for modules/plugins by name
*   configurable load-adapters for namespaces

Load-adapters Example
---------------------

```js
$.require.registerModule( "plugin1", function ( version ) {
  return "plugin1" in $ ? {
    "module": $.plugin1
  } : {
    "adapter": $.require.adapters.byName,
    "params": { "var": "jQuery.fn.plugin1" },
    "url": "/path/to/jquery.plugin1." +
      ( version ? version + "." : "" ) + "js"
  };
} );

$.require.registerNamespace( "ns1", function ( path, version ) {
  return "ns1" in $ ? {
    "module": $.ns1[path]
  } : {
    "adapter": $.require.adapters.byName,
    "params": { "var": "jQuery.ns1." + path },
    "url": "/path/to/jquery.ns1." + path + "." +
      ( version ? version + "." : "" ) + "js"
  };
} );

// to catch all other namespace/modules register namespace: ""
```

Known issues
------------

*   Default adapter for loading jQuery UI (google CDN) works only in async mode
