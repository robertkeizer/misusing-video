const Generator = function( ){
	
};

Generator.prototype.validEncoderConfig = function( ){
	return {
		moduleSize: 3,
		errorCorrectionLevel: "L",
		marginWidth: 4,
		dpi: 72
	};
};

Generator.prototype.validDebugFilesystemConfig = function( ){
	return {
		debug: true,
		encoderOptions: this.validEncoderConfig( )
	}
};

module.exports = Generator;
