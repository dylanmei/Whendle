
Whendle.AjaxService = Class.create({
	initialize: function() {
	},
	
	load: function(resource, on_ready) {
	    new Ajax.Request(resource, {
	        method: 'get',
			asynchronous: true,
			onSuccess: this._on_response.bind(this, on_ready)
	    });
	},
	
	_on_response: function(ready_callback, transport) {
		if (!ready_callback) return;
		
		var response = transport.responseText;
		if (response.isJSON()) {
			response = response.evalJSON();
		}

		ready_callback(response);
	}
});