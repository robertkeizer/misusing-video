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

	const configToUse = this.generate.validDebugFilesystemConfig( );
	const filesystem = new Filesystem( configToUse );
	filesystem.once( "ready", function( ){
		return cb( null, filesystem );
	} );

	this._newCleanupFunc( function( cb ){
		filesystem.shutdown( cb );
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

Tasks.prototype.newMountedFilesystem = function( cb ){
	const self = this;
	let _mountPath = undefined;
	async.waterfall( [ function( cb ){

		self.newTemporaryMountPath( cb );

	}, function( mountPath ){
		_mountPath = mountPath;
		self.newValidDebugFilesystem( function( err, filesystem ){
			return cb( err, filesystem );
		} );

	}, function( filesystem, cb ){

		filesystem.mount( _mountPath, function( err ){
			return cb( err, filesystem );
		} );

		self._newCleanupFunc( function( cb ){
			filesystem.unmount( _mountPath, cb );
		} );
		
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
