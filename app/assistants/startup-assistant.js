function StartupAssistant(settings, database, schema) {
	this.appController = Mojo.Controller.getAppController();
    this.stageController = this.appController.getStageController(Whendle.stage_name);
	
	this.settings = settings || Whendle.settings();
	this.database = database || Whendle.database();
	this.schema = schema || Whendle.schema();
}

StartupAssistant.prototype.setup = function() {
	this.ready = false;
	this.error = false;
	
	this.schema.destroy();
	this.schema.read(
		this.on_schema_ready.bind(this),
		this.on_schema_error.bind(this)
	);

	this.wait_for_dependencies.bind(this)
		.delay(2, this.start_application.bind(this));
}

StartupAssistant.prototype.wait_for_dependencies = function(on_ready) {
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
}

StartupAssistant.prototype.on_schema_ready = function(version) {
	Mojo.Log.info('current schema version:', version);
	
	var migrator = this.schema.migrator(version);
	if (!migrator) {
		this.ready = true;
	}
	else {
		this.schema.update(migrator,
			this.on_schema_ready.bind(this),
			this.on_schema_error.bind(this)
		);
	}
};

StartupAssistant.prototype.on_schema_error = function(error) {
	Mojo.Log.info('error preparing schema: ', error.message);
	this.error = true;
}

StartupAssistant.prototype.on_database_version = function(version) {
	Mojo.Log.info('database version', typeof(version));
	this.ready = true;
}

StartupAssistant.prototype.start_application = function(min_delay) {
	this.stageController.swapScene('clocks');
};

StartupAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	  //Mojo.Log.info('startup activate');
}

StartupAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
	  //Mojo.Log.info('startup deactivate');
}

StartupAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	  //Mojo.Log.info('startup cleanup');
}
