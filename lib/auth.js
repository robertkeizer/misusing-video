const async		= require( "async" );
const express		= require( "express" );


const Validations	= require( "./validations" );

const Auth = function( config, cb ){
	const self = this;
	async.waterfall( [ function( cb ){
		Valdiations.validate( conifg, Validations.authConfig, cb );
	}, function( validConfig, cb ){
		self.config = validConfig;

		self._start( cb );
	} ], cb );
};

Auth.prototype._start = function( cb ){
	this._app = express( );
	this._server = this._app.listen( this.config.port, cb );
};

Auth.prototype.shutdown = function( cb ){
	this._server.close( cb );
};

module.exports = Auth;
