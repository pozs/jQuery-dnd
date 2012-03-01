/*!
 * @fileOverview require plugin for jQuery
 * 
 * @example var ui = $.require("ui@1.8.2");
 * @example var button = $.require("ui.button");
 * @example <pre>
 * var widgets = $.require("ui.button", "ui.dialog"),
 *     button  = widgets[0],
 *     dialog  = widgets[1];
 * </pre>
 * @example <pre>
 * $.require("ui.button", "ui.dialog", function(button, dialog) {
 *   // use button & dialog
 * });
 * </pre>
 * 
 * @author pozs <david.pozsar@gmail.com>
 * @license http://opensource.org/licenses/gpl-3.0.html GNU General Public License
 */

;( function( $, global, undefined ) {

"use strict";

function Hash () {
    this._hash = {};
}

Hash.prototype.has = function ( key ) {
    return ( "$" + key ) in this._hash;
};

Hash.prototype.get = function ( key ) {
    return this._hash[ "$" + key ];
};

Hash.prototype.remove = function ( key ) {
    return delete this._hash[ "$" + key ];
};

Hash.prototype.set = function ( key, value ) {
    this._hash[ "$" + key ] = value;
    return this;
};

Hash.prototype.merge = function ( other ) {
    if ( other instanceof Hash ) {
        for ( var i in other._hash ) {
            this._hash[ i ] = other._hash[i];
        }
    } else {
        for ( var i in other ) {
            this._hash[ "$" + i ] = other[i];
        }
    }
    
    return this;
};

Hash.prototype.each = function ( f, context ) {
    context = context || global;
    for ( var i in this._hash ) {
        f.call( context, i.substr( 1 ), this._hash[i], this );
    }
};

var modules     = new Hash(),
    namespaces  = new Hash();

$.extend( {
    /**
     * @function
     * @name require
     * @scope jQuery
     * @param {String} ... module / plugin names
     * @param {Function|jQuery.Deferred} load load event
     * @type {jQuery.Deferred}
     * @return jQuery Deferred
     */
    "require": $.extend( function jQuery_require ( load ) {
        var last = arguments.length,
            args = [], name, mod, res, i;
        
        load = arguments[last - 1];
        
        if ( $.isFunction( load ) || load === true ||
             $.isFunction( load.promise ) ) {
            --last;
        } else {
            load = false;
        }
        
        if ( last > 0 ) {
            for ( i = 0; i < last; ++i ) {
                name = String( arguments[i] );
                
                if ( $.require.cache.has( name ) ) {
                    args[i] = $.require.cache.get( name );
                } else {
                    mod = $.require.resolve( name );
                    
                    if ( ! mod ) {
                        args[i] = null;
                    } else if ( "module" in mod ) {
                        $.require.cache.set( name, args[i] = mod.module );
                    } else {
                        res = mod.adapter.load( mod.url, !! load, mod.params );
                        
                        if ( ! res ) {
                            args[i] = null;
                        } else if ( load ) {
                            args[i] = ( function ( name, res ) {
                                return res.pipe( function ( res ) {
                                    $.require.cache.set( name, res );
                                    return res;
                                } );
                            } )( name, res );
                        } else {
                            $.require.cache.set( name, args[i] = res );
                        }
                    }
                }
            }
            
            if ( load ) {
                return $.when.apply( $, args ).then( load );
            } else {
                return last == 1 ? args[0] : args;
            }
        } else {
            if ( $.isFunction( load ) ) {
                setTimeout( load, 1 );
            }
            
            return undefined;
        }
    }, {
        "displayName": "jQuery.require",
        "UI_VERSION": "1.8",
        "UI_CDN": "http://ajax.googleapis.com/ajax/libs/jqueryui/{version}/jquery-ui.js",
        "PLUGIN_BASE": "/scripts/jquery/plugins",
        /**
         * @class
         * @name Adapter
         * @scope jQuery.require
         * @param {StringObject} params 
         */
        "Adapter": $.extend( function jQuery_require_Adapter ( params ) {
            if ( typeof params == "string" ) {
                return $.require.adapters[params];
            } else {
                return $.extend( this, params );
            }
        }, {
            "displayName": "jQuery.require.Adapter",
            "prototype": {
                "name": "",
                /**
                 * @function
                 * @name load
                 * @scope jQuery.require.prototype
                 * @param {String} path module / plugin path
                 * @type {Object}
                 * @return Module object / Deferred
                 */
                "load": $.extend( function jQuery_require_prototype_load ( path ) {
                    throw new Error( "load must be defined" );
                }, {
                    "displayName": "jQuery.require.Adapter.prototype.load"
                } )
            }
        } ),
        "cache": new Hash(),
        "adapters": {},
        /**
         * @function
         * @name resolve
         * @scope jQuery.require
         * @param {String} path module / plugin path
         * @type {Adapter}
         * @return Module object / Deferred
         */
        "resolve": $.extend( function jQuery_require_resolve ( path ) {
            path = String( path ).replace( "/", "." );
            var tmp, v = path.indexOf( "@" );
            
            if ( ~v ) {
                v = path.substr( v + 1 );
                path = path.substr( 0, path.length - v.length - 1 );
            } else {
                v = undefined;
            }
            
            modules.each( function ( key, adapter ) {
                if ( path == key ) {
                    tmp = adapter( v );
                }
            } );
            
            if ( tmp ) {
                return tmp;
            }
            
            namespaces.each( function ( key, adapter ) {
                if ( key && path.indexOf( key + "." ) === 0 ) {
                    tmp = adapter( path.substr( key.length + 1 ), v );
                }
            } );
            
            if ( tmp ) {
                return tmp;
            }
            
            if ( namespaces.has( "" ) ) {
                return namespaces.get( "" )( path, v );
            }
            
            return undefined;
        }, {
            "displayName": "jQuery.require.resolve"
        } ),
        /**
         * @function
         * @name registerModule
         * @scope jQuery.require
         * @param {String} mod module name
         * @param {Function} val return adapter values for loading
         * @type {Function}
         * @return jQuery.require
         */
        "registerModule": $.extend( function jQuery_require_registerModule ( mod, val ) {
            if ( arguments.length > 1 ) {
                modules.set( mod, val );
            } else {
                modules.merge( mod );
            }
            
            return $.require;
        }, {
            "displayName": "jQuery.require.registerModule"
        } ),
        /**
         * @function
         * @name registerNamespace
         * @scope jQuery.require
         * @param {String} ns namespace name
         * @param {Function} val return adapter values for loading
         * @type {Function}
         * @return jQuery.require
         */
        "registerNamespace": $.extend( function jQuery_require_registerNamespace ( ns, val ) {
            if ( arguments.length > 1 ) {
                namespaces.set( ns, val );
            } else {
                namespaces.merge( ns );
            }
            
            return $.require;
        }, {
            "displayName": "jQuery.require.registerNamespace"
        } )
    } )
} );

$.require.adapters.DEFAULT =
$.require.adapters.byName = new $.require.Adapter( {
    "name": "byName",
    "load": $.extend(
        function jQuery_require_adapters_byName_load ( url, async, params ) {
            var self = this,
                name = params["var"],
                req  = {
                    "url": url,
                    "async": !! async,
                    "dataType": async ? "script" : "text"
                };
            
            if ( async ) {
                return $.ajax( req ).pipe( function () {
                    return self.resolve( name );
                } );
            } else {
                req.success = function ( x ) {
                    $.globalEval( x.result );
                };
                
                $.ajax( req );
                return self.resolve( name );
            }
        }, {
            "displayName": "jQuery.require.adapters.byName.load"
        }
    ),
    "resolve": $.extend(
        function jQuery_require_adapters_byName_resolve ( name ) {
            var context = global,
                parts   = String( name ).
                    replace( "/", "." ).
                    split( "." ),
                i, p, l = parts.length;
            
            for ( i = 0; i < l; ++i ) {
                p = parts[i];
                
                if ( p in context ) {
                    context = context[p];
                } else {
                    return undefined;
                }
            }
            
            return context;
        }, {
            "displayName": "jQuery.require.adapters.byName.resolve"
        }
    )
} );

$.require.adapters.commonJS = new $.require.Adapter( {
    "name": "commonJS",
    "load": $.extend(
        function jQuery_require_adapters_commonJS_load ( url, async ) {
            var self = this,
                res  = null,
                req  = {
                    "url": url,
                    "async": !! async,
                    "dataType": "text"
                };
            
            if ( async ) {
                return $.ajax( req ).pipe( function ( data ) {
                    return self.run( data );
                } );
            } else {
                req.success = function ( data ) {
                    res = self.run( data );
                };
                $.ajax( req );
                return res;
            }
        }, {
            "displayName": "jQuery.require.adapters.commonJS.load"
        }
    ),
    "run": $.extend(
        function jQuery_require_adapters_commonJS_run ( code ) {
            var module = {
                    "exports": {}
                };
            
            return new Function( "module", "exports", "require", code +
                    "; return module.exports;" ).
                call( global, module, module.exports, $.require );
        }, {
            "displayName": "jQuery.require.adapters.commonJS.run"
        }
    )
} );

$.require.registerModule( "ui", function ( version ) {
    return "ui" in $ ? {
        "module": $.ui
    } : {
        "adapter": $.require.adapters.byName,
        "params": { "var": "jQuery.ui" },
        "url": $.require.UI_CDN.replace( "{version}",
                version || $.require.UI_VERSION )
    };
} );

$.require.registerNamespace( "ui", function ( path, version ) {
    return "ui" in $ ? {
        "module": $.ui[path]
    } : {
        "adapter": $.require.adapters.byName,
        "params": { "var": "jQuery.ui." + path },
        "url": $.require.UI_CDN.replace( "{version}",
                version || $.require.UI_VERSION )
    };
} );

$.require.registerNamespace( "", function ( path, version ) {
    var name = "jQuery." + path,
        mod = $.require.adapters.byName.resolve( path );
    
    return typeof mod == "undefined" ? {
        "adapter": $.require.adapters.byName,
        "params": { "var": name },
        "url": $.require.PLUGIN_BASE.replace( /\/+$/, "" ) +
            "/jquery." + path.replace( /^fn\./, "" ) + ".js"
    } : {
        "module": mod
    };
} );

} )( jQuery, window );
