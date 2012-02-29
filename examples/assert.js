/*!
 * assertations for js
 * 
 * @author pozs <david.pozsar@gmail.com>
 */
;( function ( global, undefined ) {

if ( global.console ) {
    if ( global.console.assert ) {
        global.assert = function assert ( test, msg ) {
            global.console.assert( test, msg );
        };
    } else if ( global.console.error ) {
        global.assert = function assert ( test, msg ) {
            if ( ! test ) {
                global.console.error( test, msg );
            }
        };
    } else if ( global.console.log ) {
        global.assert = function assert ( test, msg ) {
            if ( ! test ) {
                global.console.log( test, msg );
            }
        };
    }
}

if ( ! global.assert ) {
    global.assert = function assert ( test, msg ) {
        if ( ! test ) {
            setTimeout( function () {
                throw new Error( msg );
            }, 1 );
        }
    };
}

} )( window );
