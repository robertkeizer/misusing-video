const util	= require( "util" );
const events	= require( "events" );
const async	= require( "async" );
const spawn	= require( "child_process" ).spawn;
const tmp	= require( "tmp" );

const Validations	= require( "./validations" );

const Encoder = function( opts ){

	if( !opts ){ opts = {}; }
	
	const self = this;
	async.waterfall( [ function( cb ){
		Validations.validate( opts, Validations.encoderOptions, cb );
	}, function( validOpts, cb ){
		self.opts = validOpts;
		return cb( null );
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

Encoder.prototype.encode = function( data ){

	const self = this;

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
	} );
};

Encder.prototype._startFragmentCreationLoop = function( cb ){

	// * Listen on the 'data' event coming from encode()
	// * Pipe into this._fragObj.writeChunk
	// * Periodically check the file length; If it gets too large
	//   then go ahead and call _startVideoFragment, and gracefully
	//   handle the older fragment
	
	this.on( "data", ( data ) => {
		
	} );

	async.whilst( ( ) => {
		
	}, ( cb ) => {
		
	}, ( err ) => {
		
	} );
};

Encoder.prototype._startVideoFragment = function( cb ){
	if( this._fragObj ){
		return cb( "already_started" );
	}

	async.waterfall( [ ( cb ) => {
		tmp.file( cb );
	}, ( _path, fd, fileCleanupCb, cb ) => {
		
		const _finishFragments = ( cb ) => {
			async.waterfall( [ ( cb ) => {
				fileCleanupCb( );
			} ], cb );
		};

		return cb( null, {
			filePath: _path,
			cleanup: _finishFragments
		} );

	}, ( fragObj, cb ) => {

		// Let's go ahead and create a 
		// ffmpeg process that we can feed data
		// into using .write, that is writing to
		// that file as an output fragment.
		

	}, ( fragObj, cb ){
		this._fragObj = fragObj;
		return cb( null, this._fragObj );
	} ], cb );
};

Encoder.prototype.finishAllFragments = function( cb ){
	if( !this._fragObj ){
		return cb( null );
	]
	async.waterfall( [ ( cb ) => {
		
	}, ( cb ) => {
		this._fragObj.cleanup( cb );
	} ], cb );
};

Encoder.prototype._error = function( what ){
	this.emit( "error", what );
};

module.exports = Encoder;
