
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
	
	//this.schema.destroy();
	//this.settings.version(undefined);

	var is_initializing = this.settings.is_empty();
	var is_updating = false;

	if (is_initializing || this.settings.version() != Whendle.version) {
		is_updating = true;
		this.update_settings();
	}
	
	if (is_initializing || this.schema.version() != Whendle.schema_version) {
		is_updating = true;
		this.database_ready = false;
		this.update_schema();
	}
	
	if (is_initializing || is_updating) {
		// wait on splash screen for at least 3 seconds
		this.wait_for_dependencies.bind(this)
			.delay(3, this.start_application.bind(this));
	}

	this.setup_widgets(is_initializing, is_updating);
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
	this.stageController.swapScene('clocklist');
};

SplashAssistant.prototype.setup_widgets = function(is_initializing, is_updating) {
    this.controller.setupWidget('spinner',
         { spinnerSize: 'small' },
         { spinning: true }
	);
	
	if (is_initializing) {
		this.controller.get('message').innerHTML = $L('splash_message_first_time');
	}
	else if (is_updating) {
		this.controller.get('message').innerHTML = $L('splash_message_updating');
	}
	else {
		this.controller.get('spinner').remove();
		this.controller.get('message').innerHTML = $L('splash_message_continue');

		this.tap_handler = this.on_tap.bind(this);
		Mojo.Event.listen(this.controller.document,
			Mojo.Event.tap, this.tap_handler);
	}
}

SplashAssistant.prototype.cleanup = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
	if (this.tap_handler) {
		Mojo.Event.stopListening(this.controller.document, Mojo.Event.tap, this.tap_handler);
		delete this.tap_handler;
	}
}

SplashAssistant.prototype.on_tap = function() {
	this.start_application();
}

