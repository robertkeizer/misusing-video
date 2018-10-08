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

Generator.prototype.validAuthConfig = function( ){
	return {
		port: 5258,
		clientSecretFile: "/Users/robertkeizer/src/misusing-video/client_secret_821901397786-64phqfa2ilfg8k4jde6hnqtsmdpbjqup.apps.googleusercontent.com.json"
	};
};

module.exports = Generator;
