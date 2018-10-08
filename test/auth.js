const async	= require( "async" );

const config	= require( "config" );
const Tasks	= require( "./tasks" );

const Auth = require( "../lib/auth" );

describe( "Auth", function( ){
	it.only( "Calls the callback when started", function( cb ){
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
} );
