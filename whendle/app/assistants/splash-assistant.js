
function SplashAssistant(settings, database, schema) {
	this.appController = Mojo.Controller.getAppController();
    this.stageController = this.appController.getStageController(Whendle.stage_name);
	
	this.settings = settings || Whendle.settings();
	this.database = database || Whendle.database();
	this.schema = schema || Whendle.schema();
};

SplashAssistant.prototype.setup = function() {
	this.database_ready = true;
	this.database_error = false;

	var first_launch = this.settings.is_empty();
	if (first_launch || this.settings.version() != Whendle.version) {
		this.update_settings();
	}

	if (first_launch || this.schema.version() != Whendle.schema_version) {
		this.database_ready = false;
		this.update_schema();
	}

	// wait on splash screen for at least 3 seconds
	this.wait_for_dependencies.bind(this)
		.delay(3, this.start_application.bind(this));
};

SplashAssistant.prototype.update_schema = function(version) {
	version = version || this.schema.version();
	var migrator = this.schema.migrator(version);
	if (!migrator) {
		this.database_ready = true;
	}
	else {
		this.schema.update(migrator,
			this.on_schema_updated.bind(this),
			this.on_schema_error.bind(this)
		);
	}
};

SplashAssistant.prototype.on_schema_updated = function(version) {
	Mojo.Log.info('schema updated to', version);
	this.update_schema(version);
};

SplashAssistant.prototype.on_schema_error = function(error) {
	Mojo.Log.info('error preparing schema: ', error.message);
	this.database_error = true;
}

SplashAssistant.prototype.update_settings = function() {
	this.settings.version(Whendle.version);
	this.settings.save();
}

SplashAssistant.prototype.wait_for_dependencies = function(on_ready) {
	if (this.database_ready) {
		on_ready();
	}
	else if (this.database_error) {
		Mojo.Log.info('error loading dependencies');
	}
	else {
		this.wait_for_dependencies.bind(this)
			.delay(0.2, on_ready);
	}
};

SplashAssistant.prototype.start_application = function() {
	this.stageController.swapScene('clocks');
};
