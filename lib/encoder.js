const util	= require( "util" );
const events	= require( "events" );
const Joi	= require( "joi" );
const async	= require( "async" );
const spawn	= require( "child_process" ).spawn;

const Encoder = function( opts ){
	
	const self = this;
	async.waterfall( [ function( cb ){
		Joi.validate( opts, Joi.object( ).keys( {
			version: Joi.number( ).valid( [ '1' ] ),
		} ), cb );
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

	const qrencode = spawn( "qrencode", [ "-o", "-" ] );

	let allData = undefined;
	qrencode.stdout.on( "data", function( chunk ){
		allData += chunk;
	} );

	qrencode.stdin.write( data );
	
	const self = this;
	qrencode.once("close", function( ){
		self.emit( "data", allData  );
	} );
};

Encoder.prototype._debug = function( msg ){
	this.emit( "debug", msg );
};

Encoder.prototype._error = function( what ){
	this.emit( "error", what );
};

module.exports = Encoder;
