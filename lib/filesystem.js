const fuse	= require( "fuse-bindings" );
const util	= require( "util" );
const events	= require( "events" );
const async	= require( "async" );

const Validations	= require( "./validations" );

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
	}], function( err ){
		if( err ){ return self._error( err ); }

		self.state.ready = true;
		setImmediate( function( ){
			self.emit( "ready" );
		} );
	} );
};

util.inherits( Filesystem, events.EventEmitter );

Filesystem.prototype.mount = function( _path, cb ){

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

Filesystem.prototype.access = function( _path, mode, cb ){
	
};

Filesystem.prototype.statfs = function( _path, cb ){
	
};

Filesystem.prototype.readdir = function( _path, cb ){
	
};

Filesystem.prototype.getattr = function( _path, cb ){
	
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

module.exports = Filesystem;
