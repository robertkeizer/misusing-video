const util	= require( "util" );
const events	= require( "events" );
const async	= require( "async" );
const spawn	= require( "child_process" ).spawn;

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

Encoder.prototype._error = function( what ){
	this.emit( "error", what );
};

module.exports = Encoder;
