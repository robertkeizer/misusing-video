const Encoder = require( "../lib/encoder" );

describe( "Encoder", function( ){
	it( "Emits a ready event", function( cb ){
		const encoder = new Encoder( );
		encoder.once( "ready", function( ){
			encoder.shutdown( cb );
		} );
	} );

	it( "Calling encode results in data being emitted", function( cb ){
		this.timeout( 30000 );
		const encoder = new Encoder( );
		
		encoder.once( "ready", function( ){
			encoder.encode( "Test String" );
		} );

		encoder.once( "data", function( data ){
			setTimeout( ( ) => {
				return encoder.shutdown( cb );
			}, 5000 );
		} );
	} );

	it.only( "Calling encode and then calling .finishCurrentFragment results in fragment being emitted.", function( cb ){
		this.timeout( 30000 );
		const encoder = new Encoder( );
		
		encoder.once( "ready", function( ){
			encoder.once( "fragment", function( data ){
				console.log( "I have a fragment" );
				return cb( null );
			} );
			encoder.encode( "Test String" );

			setTimeout( ( ) => {
				encoder.shutdown( ( ) => { } );
			}, 3000 );
		} );
	} );
} );
