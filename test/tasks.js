const Tasks = function( config ){
	this.config = config;
};

Tasks.prototype.validEncoderConfig = function( ){
	return {
		moduleSize: 3,
		errorCorrectionLevel: "L",
		marginWidth: 4,
		dpi: 72
	};
};

Tasks.prototype.validYoutubeProviderConfig = function( ){
	
};

Tasks.prototype.validFilesystemConfig = function( ){
	return {
		
		encoderOptions: this.validEncoderConfig()
	}
};

module.exports = Tasks;
