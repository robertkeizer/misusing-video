const async		= require( "async" );
const express		= require( "express" );
const fs		= require( "fs" );
const Youtube		= require( "youtube-api" );

const Validations	= require( "./validations" );

let CREDENTIALS = undefined;

const Auth = function( config, cb ){
	const self = this;
	async.waterfall( [ function( cb ){
		Validations.validate( config, Validations.authConfig, cb );
	}, function( validConfig, cb ){
		self.config = validConfig;
	
		cb( null );
	}, function( cb ){

		// Let's read the credentials file and set it.
		CREDENTIALS = fs.readFileSync( self.config.clientSecretFile );
		try{
			CREDENTIALS = JSON.parse( CREDENTIALS );
			
		}catch(err){
			return cb( err );
		}

		console.log(" I have creds of" );
		console.log( CREDENTIALS );

		self.oauth = Youtube.authenticate({
			type: "oauth",
			client_id: CREDENTIALS.web.client_id,
			client_secret: CREDENTIALS.web.client_secret,
			redirect_url: CREDENTIALS.web.redirect_uris[0]
		});

		self._start( cb );
	} ], cb );
};

Auth.prototype._start = function( cb ){
	this._app = express( );

	this._app.get( "/oauth2callback", function( req, res, cb ){
		oauth.getToken( req.query.code, function( err, token ){
			if( err ){ return cb( err ); }
			
		} );
	} );

	this._server = this._app.listen( this.config.port, cb );
};

Auth.prototype.shutdown = function( cb ){
	this._server.close( cb );
};

module.exports = Auth;
