const async	= require( "async" );
const config	= require( "config" );
const Tasks	= require( "./tasks" );

const Auth = require( "../lib/auth" );

describe( "Auth", function( ){
	it( "Calls the callback when started", function( cb ){
		const tasks = new Tasks( config );
		async.waterfall( [ function( cb ){
			tasks.newAuth( cb );
		}, function( authInstance, cb ){

			if( !( authInstance instanceof Auth ) ){
				return cb( "Not instance of auth" );
			}

			return cb( null );

		}, function( cb ){
			tasks.cleanup( cb );
		} ], cb );
	} );

	it.only( "_generateAuthUrl returns a valid url..", function( cb ){
		this.timeout( 120 * 1000 );
		const tasks = new Tasks( config );
		async.waterfall( [ ( cb ) => {
			tasks.newAuth( cb );
		}, ( authInst, cb ) => {
			const _url = authInst._generateAuthUrl( );

			console.log( _url );

			return cb( null );

		}, ( cb ) => {

			setTimeout( ( ) => {
				tasks.cleanup( cb );
			}, 60*1000 );
		} ], cb );
	} );
} );
