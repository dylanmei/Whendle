

Whendle.StartupService = Class.create(Whendle.Observable, {
	initialize: function($super, schema, timekeeper) {
		$super();
		this._schema = schema || Whendle.schema();
		this._timekeeper = timekeeper || Whendle.timekeeper();
		this._ready_state = 0;
	},
	
	run: function() {
		this.setup_timekeeper();
		this.setup_schema();
	},

	setup_timekeeper: function() {
		this._timekeeper.setup(
			this.on_setup_complete.bind(this, 'timekeeper')
		);
	},
	
	setup_schema: function() {
		this._schema.read(
			this.on_setup_complete.bind(this, 'schema'),
			this.on_setup_exception.bind(this, 'schema')
		);
	},
	
	on_setup_complete: function(which) {
		var SCHEMA_READY = 1;
		var TIMEKEEPER_READY = 2;
		var STARTUP_READY = SCHEMA_READY | TIMEKEEPER_READY;

		if (which == 'schema') {
			this._ready_state |= SCHEMA_READY;
		}
		else if (which == 'timekeeper') {
			this._ready_state |= TIMEKEEPER_READY;
		}
		
		if (this._ready_state != STARTUP_READY) return;

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
			.defer.bind(this);
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