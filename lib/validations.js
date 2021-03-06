const Joi = require( "joi" );

const encoderOptions = Joi.object( ).keys( {
	moduleSize: Joi.number( ).default( 3 ),
	errorCorrectionLevel: Joi.string( ).valid( [
		"L", "M", "Q", "H" 
	] ).default( "L" ),
	marginWidth: Joi.number( ).default( 4 ),
	dpi: Joi.number( ).default( 72 )
} );

const authConfig = Joi.object( ).keys( {
	port: Joi.number( ).required( ),
	clientSecretFile: Joi.string( ).required( ),
	saveTokensToFile: Joi.string( ).optional( ).default( "" ),
} );

const filesystemOptions = Joi.object( ).keys( {
	debug: Joi.boolean( ).default( false ),
	encoderOptions: encoderOptions,
	auth: authConfig
} );

module.exports = {
	validate: Joi.validate,
	encoderOptions,
	filesystemOptions,
	authConfig,
};
