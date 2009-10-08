
function SplashAssistant(settings, database, schema) {
	this.appController = Mojo.Controller.getAppController();
    this.stageController = this.appController.getStageController(Whendle.stage_name);
	
	this.settings = settings || Whendle.settings();
	this.database = database || Whendle.database();
	this.schema = schema || Whendle.schema();
};

SplashAssistant.prototype.setup = function() {
	this.ready = false;
	this.error = false;
	
	if (this.schema.version() != Whendle.schema_version) {
		this.update_schema();
	}

	// wait on splash screen for at least 3 seconds
	this.wait_for_dependencies.bind(this)
		.delay(3, this.start_application.bind(this));
};

SplashAssistant.prototype.wait_for_dependencies = function(on_ready) {
	if (this.ready) {
		on_ready();
	}
	else if (this.error) {
		Mojo.Log.info('error loading dependencies');
	}
	else {
		this.wait_for_dependencies.bind(this)
			.delay(0.2, on_ready);
	}
};

SplashAssistant.prototype.update_schema = function(version) {
	version = version || this.schema.version();
	var migrator = this.schema.migrator(version);
	if (!migrator) {
		this.ready = true;
	}
	else {
		this.schema.update(migrator,
			this.on_schema_updated.bind(this),
			this.on_schema_error.bind(this)
		);
	}
};

SplashAssistant.prototype.on_schema_updated = function(version) {
	Mojo.Log.info('schema updated: ', version);
	this.update_schema(version);
};

SplashAssistant.prototype.on_schema_error = function(error) {
	Mojo.Log.info('error preparing schema: ', error.message);
	this.error = true;
}

SplashAssistant.prototype.on_database_version = function(version) {
	Mojo.Log.info('database version', typeof(version));
	this.ready = true;
}

SplashAssistant.prototype.start_application = function() {
	this.stageController.swapScene('clocks');
};

SplashAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	  //Mojo.Log.info('startup activate');
}

SplashAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
	  //Mojo.Log.info('startup deactivate');
}

SplashAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	  //Mojo.Log.info('startup cleanup');
}
