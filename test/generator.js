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
		encoderOptions: this.validEncoderConfig( ),
		auth: this.validAuthConfig( )
	}
};

Generator.prototype.validAuthConfig = function( ){
	return {
		port: 5258,
		clientSecretFile: "/Users/robertkeizer/src/misusing-video/client_secret_821901397786-3f026h9u0koibf6esmhhrceu895ea96c.apps.googleusercontent.com.json",
		saveTokensToFile: "/Users/robertkeizer/src/misusing-video/fs.tokens"
	};
};

module.exports = Generator;
