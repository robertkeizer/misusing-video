const Filesystem = require( "../lib/filesystem" );

describe( "Filesystem", function( ){
	it.only( "Emits ready when created properly", function( cb ){
		const filesystem = new Filesystem( );
		filesystem.once( "ready", function( ){
			return cb( null );
		} );
	} );
} );
