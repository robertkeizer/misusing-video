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

			// This line is simply because if we download
			// the 
			CREDENTIALS = CREDENTIALS.web;
		}catch(err){
			return cb( err );
		}

		self.oauth = Youtube.authenticate({
			type: "oauth",
			client_id: CREDENTIALS.client_id,
			client_secret: CREDENTIALS.client_secret,
			redirect_url: CREDENTIALS.redirect_uris[0]
		});

		self._start( cb );
	} ], cb );
};

Auth.prototype._start = function( cb ){
	this._app = express( );

	const self = this;
	this._app.get( "/oauth2callback", function( req, res, cb ){

		async.waterfall( [ function( cb ){
			self.oauth.getToken( req.query.code, cb );
		}, function( tokens, cb ){

			self._saveTokens( tokens, cb );

		}, function( tokens, cb ){

			self.oauth.setCredentials( tokens );

		} ], function( err ){
			if( err ){ return cb( err ); }

			return res.json( { "credentials_set": true } );
		} );
	} );

	this._server = this._app.listen( this.config.port, cb );
};

Auth.prototype._saveTokens = function( tokens, cb ){
	const self = this;
	async.waterfall( [ function( cb ){
		if( !self.config.saveTokensToFile ){
			return cb( null );
		}

		// Save the tokens we've been given
		// to the file specified in config.

		fs.writeFile( self.config.saveTokensToFile, JSON.stringify( {
			tokens: tokens
		} ), cb );

	} ], function( err ){
		if( err ){ return cb( err ); }
		return cb( null, tokens );
	} );
};

Auth.prototype._generateAuthUrl = function( ){
	if( !this.oauth ){
		throw new Exception( "not_started" );
	}

	return this.oauth.generateAuthUrl( {
		access_type: "offline",
		scope: ["https://www.googleapis.com/auth/youtube.upload"]
	} );
};

Auth.prototype.shutdown = function( cb ){
	this._server.close( cb );
};

module.exports = Auth;
