const Encoder = require( "../lib/encoder" );

describe( "Encoder", function( ){
	it.only( "Emits a ready event", function( cb ){
		const encoder = new Encoder( {
			version: "1"
		} );
		encoder.once( "ready", function( ){
			return cb( null );
		} );
	} );
} );
