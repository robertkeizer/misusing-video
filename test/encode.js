const Encoder = require( "../lib/encoder" );

describe( "Encoder", function( ){
	it( "Emits a ready event", function( cb ){
		const encoder = new Encoder( );
		encoder.once( "ready", function( ){
			return cb( null );
		} );
	} );

	it( "Calling encode results in data being emitted", function( cb ){
		this.timeout( 30000 );
		const encoder = new Encoder( );
		encoder.once( "ready", function( ){
			encoder.encode( "Test String" );
		} );

		encoder.once( "data", function( data ){
			return cb( null );
		} );
	} );
} );
