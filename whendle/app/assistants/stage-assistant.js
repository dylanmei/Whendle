
function StageAssistant() {
}

StageAssistant.prototype.setup = function() {
	this.load_services();

	var on_ready = this.launch.bind(this);
	
	var wait = new Whendle.Wait(on_ready);
	Whendle.timekeeper().setup(
		wait.on(this.on_timekeeper_ready.bind(this)));
	Whendle.schema().read(
		wait.on(this.on_schema_ready.bind(this)),
		this.on_schema_error.bind(this));
	wait.ready();
}

StageAssistant.prototype.launch = function() {
	this.controller.pushScene('gallery');
}

StageAssistant.prototype.load_services = function() {
	Whendle.services('Whendle.system', new Whendle.PalmService());
	Whendle.services('Whendle.database', new Whendle.DatabaseService());
	Whendle.services('Whendle.schema', new Whendle.SchemaService(Whendle.database()));
	Whendle.services('Whendle.timekeeper', new Whendle.TimekeeperService(Whendle.system()));
	
	var ajax = new Whendle.AjaxService();
	var tzloader = new Whendle.TzLoader(ajax, Whendle.tzpath);
	Whendle.services('Whendle.timezones', new Whendle.TimezoneService(ajax, tzloader));
	Whendle.services('Whendle.startup', new Whendle.StartupService(Whendle.schema()));
};

StageAssistant.prototype.on_timekeeper_ready = function() {
}

StageAssistant.prototype.on_schema_ready = function() {
	if (Whendle.reset_schema) {
		Whendle.schema().destroy();
	}
}

StageAssistant.prototype.on_schema_error = function(error) {
	Mojo.Log.error('error reading schema: ', error.message);
};

StageAssistant.prototype.on_timekeeper_error = function(error) {
	Mojo.Log.error('error starting timekeeper: ', error.message);
};
