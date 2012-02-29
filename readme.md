Require plugin for jQuery
========================

Yet another module-management system for jQuery.

Demo
----

[Examples](https://github.com/pozs/jQuery-require/tree/master/examples "Examples")

Example Usage
-------------

```js
var plugin = $.require( "plugin" );

$.require( "ui", function ( ui ) {
    console.assert( ui === $.ui );
} );

$.require( "ui.button", function ( button ) {
    console.assert( button === $.ui.button );
} );
```

Features
--------

*   configurable load-adapters for modules/plugins by name
*   configurable load-adapters for namespaces
