const util	= require( "util" );
const events	= require( "events" );
const Joi	= require( "joi" );
const async	= require( "async" );

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
			return self._emit( "ready" );
		} );
	} );
};

util.inherits( Encoder, events.EventEmitter );

Encoder.prototype.encode = function( data ){
	
};

Encoder.prototype._emit = function( what ){
	this.emit( what );
};

Encoder.prototype._debug = function( msg ){
	this.emit( "debug", msg );
};

Encoder.prototype._error = function( what ){
	this.emit( "error", what );
};

module.exports = Encoder;
