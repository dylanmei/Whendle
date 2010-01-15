

Whendle.StartupService = Class.create(Whendle.Observable, {
	initialize: function($super, schema, timekeeper) {
		$super();
		this.schema = schema || Whendle.schema();
		this.timekeeper = timekeeper || Whendle.timekeeper();
	},
	
	run: function(timer) {
		this.timer = timer;
		
		if (Whendle.reset_schema) {
			this.schema.destroy();
		}

		// 1. connect to the database (schema)
		// 2. connect to the time services (timekeeper)
		// 3. notify any listeners of our status: ready, installing, upgrading
		// 4. install or upgrade
		// 5. notify any listeners of our status: ready
		this.setup_schema();
	},
	
	setup_schema: function() {
		var on_complete = this.setup_timekeeper.bind(this);
		this.schema.read(
			on_complete,
			this.on_setup_exception.bind(this, 'schema')
		);
	},

	setup_timekeeper: function() {
		var on_complete = this.on_setup_complete.bind(this);
		this.timekeeper.setup(on_complete);
	},
	
	on_setup_complete: function() {

		if (this.is_installing()) {
			this.install();
		}
		else if (this.is_upgrading()) {
			this.upgrade();
		}
		else {
			this.start();
		}
	},
	
	start: function() {
		this.timekeeper.start(this.timer);
		this.fire(':status', { ready: true });
	},
	
	install: function() {
		this.fire(':status', { ready: false, installing: true });
		this.prepare_schema.bind(this).defer();
	},
	
	upgrade: function() {
		this.fire(':status', { ready: false, upgrading: true });
		this.prepare_schema.bind(this).defer();
	},
	
	on_setup_exception: function(which, error) {
		$.trace('exception running startup job....', which, Object.toJSON(error));
	},
	
	is_installing: function() {
		version = this.schema.version();
		return !version || version == '0.0';
	},
	
	is_upgrading: function() {
		return this.is_installing() == false
			&& this.schema.version() != this.schema.max_version();
	},
	
	prepare_schema: function() {
		this.migrate_schema(null,
			this.on_migrate_complete.bind(this),
			Prototype.emptyFunction);
	},
	
	migrate_schema: function(version, on_complete, on_error) {
		version = version || this.schema.version();

		var migrator = this.schema.migrator(version);
		if (!migrator) {
			on_complete();
		}
		else {
			this.schema.update(
				migrator,
				this.on_migrate_version.bind(this, on_complete, on_error),
				on_error
			);
		}
	},
	
	on_migrate_version: function(on_complete, on_error, version) {
		$.trace('schema updated to, ', version);
		this.migrate_schema(version, on_complete, on_error);
	},

	on_migrate_complete: function() {
		this.start();
	},
	
	on_migrate_exception: function() {
		$.trace('exception running migration job....', Object.toJSON(error));
	}
});