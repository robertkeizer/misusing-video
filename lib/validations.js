const Joi = require( "joi" );

const encoderOptions = Joi.object( ).keys( {
	moduleSize: Joi.number( ).default( 3 ),
	errorCorrectionLevel: Joi.string( ).valid( [
		"L", "M", "Q", "H" 
	] ).default( "L" ),
	marginWidth: Joi.number( ).default( 4 ),
	dpi: Joi.number( ).default( 72 )
} );

const providerYoutubeOptions = Joi.object( ).keys( {
	apiKey: Joi.string( ).required( )
} );

// At some point tighten the instances up a bit.
const filesystemOptions = Joi.object( ).keys( {
	encoder: Joi.object( ).any(),
	provider: Joi.object( ).any(),
} );

module.exports = {
	validate: Joi.validate,
	encoderOptions,
	filesystemOptions
};
