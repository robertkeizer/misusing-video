const uuid		= require( "uuid" );
const async		= require( "async" );
const fs		= require( "fs" );

const Generator		= require( "./generator" );
const Filesystem	= require( "../lib/filesystem" );
const Auth		= require( "../lib/auth" );

const Tasks = function( config ){
	this.config	= config;
	this.generate	= new Generator( config );

	this._cleanupFuncs = [ ];
};

Tasks.prototype.newValidDebugFilesystem = function( cb ){
	const filesystem = new Filesystem( this.generate.validDebugFilesystemConfig( ) );
	filesystem.once( "ready", function( ){
		return cb( null, filesystem );
	} );
};

Tasks.prototype.newTemporaryMountPath = function( cb ){
	const _pathToUse = "/tmp/misusing-video-" + uuid.v4();

	const self = this;
	async.waterfall( [ function( cb ){
		fs.mkdir( _pathToUse, cb );
	} ], function( err ){
		self._newCleanupFunc( function( cb ){
			fs.rmdir( _pathToUse );
			return cb( null );
		} );
		return cb( err, _pathToUse );
	} );
};

Tasks.prototype.newAuth = function( cb ){
	const self = this;
	async.waterfall( [ function( cb ){
		const authConfigToUse	= self.generate.validAuthConfig( );
		const authInstance = new Auth( authConfigToUse, function( err ){
			setImmediate( function( ){
				return cb( err, authInstance );
			} );
		} );
	}, function( authInstance, cb ){
		self._newCleanupFunc( function( cb ){
			authInstance.shutdown( cb );
		} );

		return cb( null, authInstance );
	} ], cb );
};

Tasks.prototype._newCleanupFunc = function( func ){
	this._cleanupFuncs.push( func );
};

Tasks.prototype.cleanup = function( cb ){
	async.eachSeries( this._cleanupFuncs, function( func, cb ){
		func( cb );
	}, cb );
};

module.exports = Tasks;
