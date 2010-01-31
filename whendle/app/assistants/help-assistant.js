
HelpAssistant = Class.create({
	initialize: function() {
	},
	
	setup: function() {
		var content = this.controller.get('help');
		var version = content.down('.help-app-version');
		version.update('v' + Whendle.version + version.innerHTML);
		
		var items = content.querySelectorAll('div.palm-row');
		var controller = this.controller;
		items[0].observe('click', function() {
			controller.serviceRequest('palm://com.palm.applicationManager', {
				method: 'open',
				parameters: {
					id: 'com.palm.app.browser',
						params: {
							target: Whendle.homepage
						}
					}
				})
		});
		
		items[1].observe('click', function() {
			controller.serviceRequest('palm://com.palm.applicationManager', {
				method: 'launch',
				parameters: {
					id: 'com.palm.app.email',
						params: {
							recipients: [{
								role: 1,
								value: Whendle.email
							}],
							summary: 'Regarding Whendle v{#version}...'.interpolate(Whendle)
						}
					}
				})
		});
	},
	
	cleanup: function(event) {
	}	
});
