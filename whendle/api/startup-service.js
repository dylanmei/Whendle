

Whendle.StartupService = Class.create(Whendle.Observable, {
	initialize: function($super, schema, timekeeper) {
		$super();
		this._schema = schema || Whendle.schema();
		this._timekeeper = timekeeper || Whendle.timekeeper();
	},
	
	run: function() {
		// 1. connect to the database (schema)
		// 2. connect to the time services (timekeeper)
		// 3. notify any listeners of our status: ready, installing, upgrading
		// 4. install or upgrade
		// 5. notify any listeners of our status: ready
		
		this.setup_schema();
	},

	setup_schema: function() {
		var on_complete = this.setup_timekeeper.bind(this);
		this._schema.read(
			on_complete,
			this.on_setup_exception.bind(this, 'schema')
		);
	},

	setup_timekeeper: function() {
		var on_complete = this.on_setup_complete.bind(this);
		this._timekeeper.setup(on_complete);
	},
	
	on_setup_complete: function() {

		var notice = { ready: true };
		if (this.is_installing()) {
			notice.ready = false;
			notice.installing = true;
		}
		else if (this.is_upgrading()) {
			notice.ready = false;
			notice.upgrading = true;
		}

		this.fire(':status', notice);
		this.prepare_schema
			.bind(this).defer();
	},
	
	on_setup_exception: function(which, error) {
		$.trace('exception running startup job....', which, Object.toJSON(error));
	},
	
	is_installing: function() {
		version = this._schema.version();
		return !version || version == '0.0';
	},
	
	is_upgrading: function() {
		return this.is_installing() == false
			&& this._schema.version() != this._schema.max_version();
	},
	
	prepare_schema: function() {
		if (!this.is_installing() && !this.is_upgrading()) return;
	
		this.migrate_schema(null,
			this.on_migrate_complete.bind(this),
			Prototype.emptyFunction);
	},
	
	migrate_schema: function(version, on_complete, on_error) {
		version = version || this._schema.version();

		var migrator = this._schema.migrator(version);
		if (!migrator) {
			on_complete();
		}
		else {
			this._schema.update(
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
		this.fire(':status', { ready: true });
	},
	
	on_migrate_exception: function() {
		$.trace('exception running migration job....', Object.toJSON(error));
	}
});