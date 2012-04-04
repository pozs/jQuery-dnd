Native HTML5 DnD plugin for jQuery
==================================

Fixes inconsistencies across browsers about the HTML5 native DnD implementations.

* no need to cancel several events
* adds support for additional media-types in dataTransfer.setData() / getData()  
  f.ex. "text/x-misc"

Demo
----

[Examples](https://github.com/pozs/jQuery-dnd/tree/master/examples "Examples")

Example Usage
-------------

```js
// Simple set-up

$( "#drag" ).drag( function ( evt ) {
  // setup drag
  evt.dataTransfer.effectAllowed = $.dnd.EFFECT_ALL; // "all"
  evt.dataTransfer.setData( "text/x-misc", "Misc data" );
  evt.dataTransfer.setDragImage( "<image url or image node>", -10, -10 );
  $( this ).addClass( "active" );
} );

$( "#drop" ).drop( function ( evt ) {
  // handle drop
  console.log( evt.dataTransfer.getData( "text/x-misc" ) );
} );

// Advanced usage

$( "#drag" ).drag( function ( evt ) {
  // drag start
}, function ( evt ) {
  // drag end
} );

$( "#drop" ).drop( function ( evt ) {
  // drop
}, function ( evt ) {
  // dragover
}, function ( evt ) {
  // dragenter
}, function ( evt ) {
  // dragleave
}, function ( evt ) {
} );

// or

$( "#drag" ).drag( {
    "start": function ( evt ) {
        // drag start // required
    },
    "end": function ( evt ) {
        // drag end
    }
} );

$( "#drop" ).drop( {
    "drop": function ( evt ) {
        // drop // required
    },
    "over": function ( evt ) {
        // dragover
    },
    "enter": function ( evt ) {
        // dragenter
    },
    "leave": function ( evt ) {
        // dragleave
    }
} );

```

Additional features
-------------------

* "html" is an alias for "text/html"
* when "text/html" is set, "text/plain" is also set with tags stripped

Browser compatibility
---------------------

* IE 6+
* Firefox 4+
* Chrome
* Opera 12+
