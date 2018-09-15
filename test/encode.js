const Encoder = require( "../lib/encoder" );

describe( "Encoder", function( ){
	it( "Emits a ready event", function( cb ){
		const encoder = new Encoder( {
			version: "1"
		} );
		encoder.once( "ready", function( ){
			return cb( null );
		} );
	} );

	it.only( "Calling encode results in data being emitted", function( cb ){
		this.timeout( 30000 );
		const encoder = new Encoder( {
			version: "1"
		} );
		encoder.once( "ready", function( ){
			console.log( "Calling encode" );
			encoder.encode( "Test String" );
		} );

		encoder.once( "data", function( data ){
			console.log( "I have data of ");
			console.log( data );
			return cb( null );
		} );
	} );
} );
