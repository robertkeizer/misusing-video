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
		youtubeClientId: "821901397786-64phqfa2ilfg8k4jde6hnqtsmdpbjqup.apps.googleusercontent.com",
		encoderOptions: this.validEncoderConfig( )
	}
};

module.exports = Generator;
