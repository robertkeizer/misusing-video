const crypto	= require( "crypto" );
const util	= require( "util" );
const events	= require( "events" );

const fuse	= require( "fuse-bindings" );
const async	= require( "async" );

const Encoder		= require( "./encoder" );
const Validations	= require( "./validations" );
const Auth		= require( "./auth" );

const Filesystem = function( opts ){

	if( !opts ){ opts = {}; }

	this.state = {
		ready: false,
		mounted: false,
		mountedPath: "",
	};

	const self = this;
	async.waterfall( [ function( cb ){
		Validations.validate( opts, Validations.filesystemOptions, cb );
	}, function( validOpts, cb ){
		self.opts = validOpts;
		return cb( null );
	}, function( cb ){

		self.encoder = new Encoder( self.opts.encoderOptions );
		self.encoder.once( "ready", function( ){
			return cb( null );
		} );

	}, function( cb ){

		self._createAuthInstance( function( err, authInst ){
			if( err ){ return cb( err ); }

			self.auth = authInst;
			self.Youtube = authInst.getYoutube( );
			return cb( null );
		} );

	}], function( err ){
		if( err ){ return self._error( err ); }

		self.state.ready = true;
		setImmediate( function( ){
			self.emit( "ready" );
		} );
	} );
};

util.inherits( Filesystem, events.EventEmitter );

Filesystem.prototype._createAuthInstance = function( cb ){
	const self = this;
	async.waterfall( [ function( cb ){
		const auth = new Auth( self.opts.auth, function( err ){
			setImmediate( function( ){
				return cb( err, auth );
			} );
		} );
	}, function( authInst, cb ){
		authInst.loadTokensFromFile( function( err ){

			if( err ){
				// Make sure to note this in the future
				// that we aren't actually ready to mount
				// stuff because we don't have a valid
				// token.
				
			}
			return cb( null, authInst );
		} );
	} ], cb );
};

Filesystem.prototype.mount = function( _path, cb ){

	this._debugFuncCall( "mount", arguments );

	if( this.state.mounted ){
		return cb( "already_mounted" );
	}

	if( !this.state.ready ){
		return cb( "not_ready" );
	}

	const self = this;
	fuse.mount( _path, this, function( err ){
		if( err ){ return cb( err ); }

		self.state.mounted = true;
		self.state.mountedPath = _path;

		return cb( null );
	} );
};

Filesystem.prototype.unmount = function( _path, cb ){
	this._debugFuncCall( "unmount", arguments );
	if( !this.state.mounted ){
		return cb( "not_mounted" );
	}

	const self = this;
	fuse.unmount( this.state.mountedPath, function( err ){
		if( err ){ return cb( err ); }

		self.state.mounted = false;
		self.state.mountedPath = "";

		return cb( null );
	} );
};

Filesystem.prototype._getVideosForPath = function( _path, cb ){
	this._debugFuncCall( "getVideosForPath", arguments );

	
	const playlistName = this._hash( _path );

	this.Youtube.search.list( {
		type: "playlist",
		q: playlistName,
		part: "snippet"
	}, function( err, result ){
		console.log( "I have err of" );
		console.log( err );


		console.log( "Result is" );
		console.log( result );

		return cb( "ack" );
	} );
};

Filesystem.prototype.readdir = function( _path, cb ){
	this._debugFuncCall( "readdir", arguments );

	const self = this;
	async.waterfall( [ function( cb ){
		self._getVideosForPath( _path, cb );
	}, function( videos, cb ){
		
	} ], cb );
};

Filesystem.prototype.getattr = function( _path, cb ){
	
};


Filesystem.prototype.access = function( _path, mode, cb ){
	
};

Filesystem.prototype.statfs = function( _path, cb ){
	
};

Filesystem.prototype.fgetattr = function( _path, fd, cb ){
	
};

Filesystem.prototype.flush = function( _path, fd, cb ){
	
};

Filesystem.prototype.fsync = function( _path, fd, cb ){
	
};

Filesystem.prototype.fsyncdir = function( _path, fd, cb ){
	
};

Filesystem.prototype.truncate = function( _path, size, cb ){
	
};

Filesystem.prototype.ftruncate = function( _path, size, fd, cb ){

};

Filesystem.prototype.readlink = function( _path, cb ){
	
};

Filesystem.prototype.chown = function( _path, uid, gid, cb ){

};

Filesystem.prototype.chmod = function( _path, mode, cb ){
	
};

Filesystem.prototype.mknod = function( _path, mode, dev, cb ){
	
};

Filesystem.prototype.setxattr = function( _path, name, buffer, length, offset, flags, cb ){
	
};

Filesystem.prototype.getxattr = function( _path, name, buffer, length, offset, cb ){
	
};

Filesystem.prototype.listxattr = function( _path, buffer, length, cb ){
	
};

Filesystem.prototype.removexattr = function( _path, name, cb ){
	
};

Filesystem.prototype.opendir = function( _path, flags, cb ){
	
};

Filesystem.prototype.open = function( _path, flags, cb ){
	
};

Filesystem.prototype.read = function( _path, fd, buffer, length, position, cb ){
	
};

Filesystem.prototype.write = function( _path, fd, buffer, length, position, cb ){
	
};

Filesystem.prototype.release = function( _path, fd, cb ){
	
};

Filesystem.prototype.releasedir = function( _path, fd, cb ){
	
};

Filesystem.prototype.create = function( _path, mode, cb ){
	
};

Filesystem.prototype.utimens = function( _path, atime, mtime, cb ){
	
};

Filesystem.prototype.unlink = function( _path, cb ){
	
};

Filesystem.prototype.rename = function( src, dest, cb ){
	
};

Filesystem.prototype.link = function( src, dest, cb ){
	
};

Filesystem.prototype.symlink = function( src, dest, cb ){
	
};

Filesystem.prototype.mkdir = function( _path, mode, cb ){
	
};

Filesystem.prototype.rmdir = function( _path, cb ){
	
};

Filesystem.prototype.destroy = function( cb ){
	
};

Filesystem.prototype._error = function( err ){
	this.emit( "error", err );
};

Filesystem.prototype._debugFuncCall = function( funcName, args ){
	
	const stringToUseForDebug = funcName + ": " + JSON.stringify( args );
	if( !this.opts.debug ){
		return this.emit( "debug", stringToUseForDebug );
	}
	console.log( stringToUseForDebug );
};

Filesystem.prototype.shutdown = function( cb ){
	const self = this;
	async.waterfall( [ function ( cb ){

		if( self.auth ){
			return self.auth.shutdown( cb );
		}
		return cb( null );
	} ], cb );
};

Filesystem.prototype._hash = function( str ){
	const secret = "";
	return crypto.createHmac('sha256', secret)
                   .update(str)
                   .digest('hex');
};

module.exports = Filesystem;
