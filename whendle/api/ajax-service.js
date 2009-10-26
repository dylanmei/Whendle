
Whendle.AjaxService = Class.create({
	initialize: function() {
	},
	
	load: function(resource, on_ready, on_error) {
		var error_handler = this._on_error.bind(this, on_error || Prototype.emptyFunction);
	    new Ajax.Request(resource, {
	        method: 'get',
			asynchronous: true,
			onSuccess: this._on_response.bind(this, on_ready),
			onFailure: error_handler
	    });
	},
	
	_on_response: function(ready_callback, transport) {
		if (!ready_callback) return;
		
		var response = transport.responseText;
		if (response.isJSON()) {
			response = response.evalJSON();
		}

		ready_callback(response);
	},
	
	_on_error: function(on_error, data) {
		var request = data.request;
		var error = { 'code': 0, 'message': 'Ajax error' };

		if (request && request.transport) {
			error.code = request.transport.status;
			error.message = error.code + ' ' + request.transport.statusText;
		}
		
		on_error(error);
	}
});