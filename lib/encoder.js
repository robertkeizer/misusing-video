const util	= require( "util" );
const events	= require( "events" );
const async	= require( "async" );
const spawn	= require( "child_process" ).spawn;
const tmp	= require( "tmp" );

const Validations	= require( "./validations" );

const Encoder = function( opts ){

	if( !opts ){ opts = {}; }

	this._encoderLoopShouldStop = false;
	
	const self = this;
	async.waterfall( [ function( cb ){
		Validations.validate( opts, Validations.encoderOptions, cb );
	}, function( validOpts, cb ){
		self.opts = validOpts;
		return cb( null );
	}, function( cb ){

		self._startEncoderLoop( );
		self._startFragmentLoop( );

	} ], function( err ){
		if( err ){
			return self._error( err );
		}
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

		async.waterfall( [ ( cb ) => {
			fs.stat( this._fragObj.filePath, cb );
		}, ( statObj, cb ){
			// Compare the file size with a reasonable
			// threshold.

			//TODO make this a config variable.

			
	
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
	if( this._fragObj ){
		return cb( "already_started" );
	}

	async.waterfall( [ ( cb ) => {
		tmp.file( cb );
	}, ( _path, fd, fileCleanupCb, cb ) => {


		// Let's go ahead and create an ffmpeg process
		// that we will feed in data to over stdin
		// and will write to the fragment file.
		
		
		const _finishFragment = ( cb ) => {
			async.waterfall( [ ( cb ) => {
				// Close the stdin of the ffmpeg
				// process so that we signal that
				// ffmpeg should finish up.
			}, ( cb ) => {
				fileCleanupCb( );
			} ], cb );
		};

		return cb( null, {
			filePath: _path,
			cleanup: _finishFragment
		} );

	}, ( fragObj, cb ){
		this._fragObj = fragObj;
		return cb( null, this._fragObj );
	} ], cb );
};

Encoder.prototype._error = function( what ){
	this.emit( "error", what );
};

Encoder.prototype.shutdown = function( cb ){

	// Shut down the encoder loop next time around
	this._encoderLoopShouldStop = true;

	// Stop listening internally on 'data' events
	// to create fragments..
	if( this._fragmentLoopHandler ){
		this.removeEventListener( "data", this._fragmentLoopHandler );
	}

	async.waterfall( [ ( cb ) => {
		this.finishAllFragments( cb );
	} ], cb );
};

module.exports = Encoder;
