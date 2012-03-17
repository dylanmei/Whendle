
Whendle.PalmService = Class.create({
	initialize: function() {
	},
	
	request: function(uri, options) {
		return new Mojo.Service.Request(uri, options);
	}
});