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
		youtubeApiKey: "AIzaSyAT40U20h4k2Nc9WCpqf5o9mbdeOW4E1CQ", // This is IP limited - good luck using it. It's just for dev anyways. Go fuck yourself.
		encoderOptions: this.validEncoderConfig( )
	}
};

module.exports = Generator;
