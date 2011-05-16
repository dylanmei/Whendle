
HelpAssistant = Class.create({
	initialize: function() {
	},
	
	setup: function() {
		this.setup_orientation();
		this.setup_links();
	},
	
	setup_orientation: function() {
		var stage_controller = this.controller.stageController;
		if (stage_controller.getWindowOrientation() != 'up')
			stage_controller.setWindowOrientation('up');
	},
	
	setup_links: function() {
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
							target: Whendle.helppage + '?v=' + Whendle.version
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
							summary: 'Regarding Whendle v#{version}...'.interpolate(Whendle)
						}
					}
				})
		});
	},
	
	cleanup: function(event) {
	}	
});
