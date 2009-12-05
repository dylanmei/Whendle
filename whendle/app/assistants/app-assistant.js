
function AppAssistant (appController) {
}

AppAssistant.prototype.setup = function() {
};

//  -------------------------------------------------------
//  handleLaunch - called by the framework when the application is asked to launch
//    - First launch; create card stage and first first scene
//    - Update; after alarm fires to update feeds
//    - Notification; after user taps banner or dashboard
//
AppAssistant.prototype.handleLaunch = function (launch_params) {
	if (launch_params) {
		Mojo.Log.info('AppAssistant.handleLaunch called with parameters.');
	}
	else {
		if (this.try_focus_stage()) return;

		this.load_services();
		this.load_dependencies(
			this.launch.bind(this));
	}
};

AppAssistant.prototype.try_focus_stage = function() {
	var existingController = this.controller.getStageController(Whendle.stage_name);
	if (existingController) {
		Mojo.Log.info('focusing stage');
		existingController.popScenesTo('gallery');    
		existingController.activate();
		return true;
	}
	return false;
};

AppAssistant.prototype.load_services = function() {
	Whendle.services('Whendle.system', new Whendle.PalmService());
	Whendle.services('Whendle.settings', new Whendle.SettingsService());
	Whendle.services('Whendle.database', new Whendle.DatabaseService());
	Whendle.services('Whendle.schema', new Whendle.SchemaService(Whendle.database()));
	Whendle.services('Whendle.timekeeper', new Whendle.TimekeeperService(Whendle.system()));
	
	var ajax = new Whendle.AjaxService();
	var tzloader = new Whendle.TzLoader(ajax, Whendle.tzpath);
	Whendle.services('Whendle.timezones', new Whendle.TimezoneService(ajax, tzloader));
};

AppAssistant.prototype.load_dependencies = function(on_complete) {
	var wait = new Whendle.Wait(on_complete);
	Whendle.timekeeper().setup(
		wait.on(this.on_timekeeper_ready.bind(this)));
	Whendle.schema().read(
		wait.on(this.on_schema_ready.bind(this)),
		this.on_schema_error.bind(this));
	wait.ready();
};

AppAssistant.prototype.on_timekeeper_ready = function() {
	var settings = Whendle.settings();
	var timekeeper = Whendle.timekeeper();
	settings.time_format = timekeeper.format();
}

AppAssistant.prototype.on_schema_ready = function() {
}

AppAssistant.prototype.on_schema_error = function(error) {
	Mojo.Log.info('error reading schema: ', error.message);
};

AppAssistant.prototype.launch = function() {
	var scene_name = this.should_show_splash()
		? 'splash' : 'gallery';

	this.controller.createStageWithCallback(
		{ name: Whendle.stage_name, lightweight: true },
		this.get_scene_loader(scene_name), 'card');
};

AppAssistant.prototype.should_show_splash = function() {
	return Whendle.show_splash || this.are_settings_stale() || this.is_database_stale();
}

AppAssistant.prototype.are_settings_stale = function() {
	if (Whendle.reset_settings) return true;
	var settings = Whendle.settings();
	return settings.is_empty();
}

AppAssistant.prototype.is_database_stale = function() {
	if (Whendle.reset_schema) return true;
	var schema = Whendle.schema();
	return schema.version() != Whendle.schema_version;
}

AppAssistant.prototype.get_scene_loader = function(name) {
	return (function(stageController) { stageController.pushScene(name); });
};
