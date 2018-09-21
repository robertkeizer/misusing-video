const Joi = require( "joi" );

const encoderOptions = Joi.object( ).keys( {
	moduleSize: Joi.number( ).default( 3 ),
	errorCorrectionLevel: Joi.string( ).valid( [
		"L", "M", "Q", "H" 
	] ).default( "L" ),
	marginWidth: Joi.number( ).default( 4 ),
	dpi: Joi.number( ).default( 72 )
} );

// At some point tighten the instances up a bit.
const filesystemOptions = Joi.object( ).keys( {
	youtubeApiKey: Joi.string( ).required( ),
	debug: Joi.boolean( ).default( false ),
	encoderOptions: encoderOptions,
} );

module.exports = {
	validate: Joi.validate,
	encoderOptions,
	filesystemOptions
};
