const async		= require( "async" );
const uuid		= require( "uuid" );
const Tasks		= require( "./tasks" );

describe( "Filesystem", function( ){
	it( "Emits ready when created properly", function( cb ){
		const tasks = new Tasks( );
		// If we get a proper callback here, we've hooked
		// on ready already.
		tasks.newValidDebugFilesystem( cb );
	} );

	describe( "Mount", function( ){
		it( "Can be called", function( cb ){

			this.timeout( 30000 );

			const tasks = new Tasks( );
			let mountPathToUse = "";
			async.waterfall( [ function( cb ){
				tasks.newTemporaryMountPath( cb );
			}, function( _mountPath, cb ){
				mountPathToUse = _mountPath;
				return cb( null );
			}, function( cb ){
				tasks.newValidDebugFilesystem( cb );
			}, function( filesystemInst, cb ){
				filesystemInst.mount( mountPathToUse, function( err ){
					if( err ){ return cb( err ); }
					return cb( null, filesystemInst );
				} );
			}, function( filesystemInst, cb ){
				filesystemInst.unmount( mountPathToUse, cb );
			}, function( cb ){
				tasks.cleanup( cb );
			} ], cb );
		} );
	} );
} );
