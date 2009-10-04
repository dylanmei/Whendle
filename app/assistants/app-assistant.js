
function AppAssistant (appController) {
}

AppAssistant.prototype.setup = function() {
	this.settings = new Whendle.SettingsService();
};

//  -------------------------------------------------------
//  handleLaunch - called by the framework when the application is asked to launch
//    - First launch; create card stage and first first scene
//    - Update; after alarm fires to update feeds
//    - Notification; after user taps banner or dashboard
//
AppAssistant.prototype.handleLaunch = function (launch_params) {
	this.prepare_settings();
	
	if (launch_params) {
		Mojo.Log.info('AppAssistant.handleLaunch called with parameters.');
	}
	else {
		if (!this.try_focus_stage()) {
			this.prepare_services();
			this.launch_startup();
        }
	}
};

AppAssistant.prototype.try_focus_stage = function() {
	var existingController = this.controller.getStageController(Whendle.stage_name);
	if (existingController) {
		Mojo.Log.info('focusing stage');
		existingController.popScenesTo("clocks");    
		existingController.activate();
		return true;
	}
	return false;
};

AppAssistant.prototype.launch_startup = function() {
	var on_push_scene = function(stageController) {
		stageController.pushScene('startup');
	};

	this.controller.createStageWithCallback(
		{ name: Whendle.stage_name, lightweight: true },
		on_push_scene.bind(this), 'card');
};

AppAssistant.prototype.prepare_settings = function() {
	if (this.settings.is_empty()) {
	}
	if (this.settings.version() != Whendle.version) {
	}
	// this.settings.flush();
}

AppAssistant.prototype.prepare_services = function() {
	Whendle.services('Whendle.settings', this.settings);
	Whendle.services('Whendle.database', new Whendle.DatabaseService());
	Whendle.services('Whendle.schema', new Whendle.SchemaService(Whendle.database()));
};
