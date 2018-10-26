const util	= require( "util" );
const events	= require( "events" );
const async	= require( "async" );
const spawn	= require( "child_process" ).spawn;
const tmp	= require( "tmp" );
const fs	= require( "fs" );

const Validations	= require( "./validations" );

const Encoder = function( opts ){

	if( !opts ){ opts = {}; }

	this._encoderLoopShouldStop = false;

	this._encodeQueue = [ ];
	
	const self = this;
	async.waterfall( [ function( cb ){
		Validations.validate( opts, Validations.encoderOptions, cb );
	}, function( validOpts, cb ){
		self.opts = validOpts;
		return cb( null );
	}, function( cb ){

		self._startVideoFragment( cb );

	}, function( cb ){

		self._startEncoderLoop( );
		self._startFragmentLoop( );

		self._startNc( );

		return cb( null );

	} ], function( err ){
		if( err ){ return self._error( err ); }
		setImmediate( function( ){
			return self.emit( "ready" );
		} );
	} );
};

util.inherits( Encoder, events.EventEmitter );

// Simple function that gets exposed.. just push
// onto a simple queue for now.
Encoder.prototype.encode = function( data ){
	this._encodeQueue.push( data );
};

Encoder.prototype._startEncoderLoop = function( ){

	const self = this;

	async.whilst( ( ) => {
		return !this._encoderLoopShouldStop;
	}, ( cb ) => {
		const data = this._encodeQueue.shift();
		if( !data ){

			// Wait 100ms before bothering to
			// check the queue again
			setTimeout( ( ) => {
				return cb( null );
			}, 100 );
			return;
		}
		
		// We have data! Let's go ahead and run qrencode on it.

		const qrencode = spawn( "qrencode", [
			"-s", self.opts.moduleSize,
			"-l", self.opts.errorCorrectionLevel,
			"-m", self.opts.marginWidth,
			"-d", self.opts.dpi,
			"-o", "-" ]
		);

		let allData = "";
		qrencode.stdout.on( "data", function( chunk ){
			allData += chunk;
		} );

		qrencode.stdin.write( data );
		qrencode.stdin.end();
		
		qrencode.once("close", function( ){
			self.emit( "data", allData  );

			// Continue with the next piece of data
			// in the encode queue if there is one..
			return cb( null );
		} );
	}, ( err ) => {
		if( err ){ return this._error( err ); }
	} );
};

Encoder.prototype._startNc = function( ){
	// We're going to use nc to shove data to the different fragment
	// listeners.
	this._nc = spawn( "nc", [ "-l", "-k", "1337" ] );
};

Encoder.prototype._startFragmentLoop = function( cb ){

	// * Listen on the 'data' event coming from encode()
	// * Pipe into this._fragObj.writeChunk
	// * Periodically check the file length; If it gets too large
	//   then go ahead and call _startVideoFragment, and gracefully
	//   handle the older fragment

	this._fragmentLoopHandler = ( data ) => {
		this._fragObj.handleData( data );
	};
	
	this.on( "data", this._fragmentLoopHandler );

	async.whilst( ( ) => {
		return !this._shouldFragmentLoopStop;
	}, ( cb ) => {

		// This exists because we start looping right away..
		// but we may not have a fragment started yet.
		if( !this._fragObj ){
			setTimeout( ( ) => {
				return cb( null );
			}, 300 );
			return;
		}

		async.waterfall( [ ( cb ) => {
			fs.stat( this._fragObj.filePath, cb );
		}, ( statObj, cb ) => {
			// Compare the file size with a reasonable
			// threshold.

			//TODO make this a config variable.
			if( statObj.blksize > 1024*10*4 ){	// ~4mbytes
				console.log( "I hvae a filesize hit" );
				return this.finishCurrentFragment( cb );
			}
			return cb( null );
	
		} ], ( err ) => {
			// We should never get an error stating or
			// calling _startVideoFragment..
			if( err ){ return this._error( err ); }

			setTimeout( ( ) => {
				cb( null );
			}, 500 );
		} );

	}, ( err ) => {
		if( err ){ return this._error( err ); }
	} );
};

Encoder.prototype._startVideoFragment = function( cb ){
	async.waterfall( [ ( cb ) => {
		tmp.file( cb );
	}, ( _path, fd, fileCleanupCb, cb ) => {

		// Let's go ahead and create an ffmpeg process
		// that we will feed in data to over stdin
		// and will write to the fragment file.
		console.log( "Starting ffmpeg" );
		const ffmpeg = spawn( "ffmpeg", [
			"-f", "image2pipe",
			"-framerate", "1",
			"-i", "-",
			"-c:v", "libx264",
			"-vf", "format=yuv420p",
			"-r", "25",
			_path
		] );

		ffmpeg.on( "error", function( err ){
			console.log( "ERRO RIS " );
			
		} );
		ffmpeg.stderr.on( "data", function( data ){
			console.log( "erro: " + data );
		} );

		ffmpeg.stdout.on( "data", function( data ){
			console.log( data );
		} );

		const _finishFragment = ( cb ) => {
			async.waterfall( [ ( cb ) => {
				ffmpeg.once( "close", ( ) => {
					return cb( null );
				} );
				ffmpeg.stdin.end( );
			}, ( cb ) => {
				console.log( "I have _path" );
				console.log( _path );
				//fileCleanupCb( );
				return cb( null );
			} ], cb );
		};

		const handleData = ( data ) => {
			console.log( "Writing into nc" );
			this._nc.stdin.write( data );
		};

		return cb( null, {
			filePath: _path,
			cleanup: _finishFragment,
			handleData,
		} );

	}, ( fragObj, cb ) => {
		this._fragObj = fragObj;
		return cb( null );
	} ], cb );
};

Encoder.prototype._error = function( what ){
	this.emit( "error", what );
};

Encoder.prototype.finishCurrentFragment = function( cb, dontCreateAnother ){
	async.waterfall( [ ( cb ) => {
		this.emit( "fragment", this._fragObj.filePath );
		return cb( null );
	}, ( cb ) => {

		// Keep a reference to the old fragment
		// object so that we can call .cleanup on it
		const _existingFrag = this._fragObj;

		// We might have been asked to shutdown and not create
		// another video fragment.. lets not do that if we've been asked.
		if( dontCreateAnother ){
			return cb( null, _existingFrag );
		}

		console.log( "Calling _startVideoFragment from inside finishCurrentFrag" );
		// Create and overwrite .fragObj
		this._startVideoFragment( ( err ) => {
			return cb( err, _existingFrag );
		} );

	}, ( existingFrag, cb ) => {
		existingFrag.cleanup( cb );
	} ], cb );
};

Encoder.prototype.shutdown = function( cb ){

	this._nc.stdin.end();

	// Shut down the encoder loop next time around
	this._encoderLoopShouldStop = true;

	// Stop the loop that checks the fragment length
	this._shouldFragmentLoopStop = true;

	// Stop listening internally on 'data' events
	// to create fragments..
	if( this._fragmentLoopHandler ){
		this.removeListener( "data", this._fragmentLoopHandler );
	}

	// This timeout exists so that the loops
	// can finish; they might be in the middle of a fs.stat
	// or similar.
	setTimeout( ( ) => {
	
		async.waterfall( [ ( cb ) => {
			// Stop the current frag and don't create another one
			console.log( "Calling finishCurrentFragment with no create" );
			this.finishCurrentFragment( cb, true );
		} ], ( err ) => {
			return cb( null );
		} );
	}, 5000 );
};

module.exports = Encoder;
