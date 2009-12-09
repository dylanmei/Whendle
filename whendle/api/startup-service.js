
Whendle.StartupService = Class.create({
	initialize: function(schema) {
		this._schema = schema || Whendle.schema();
	},
	
	ready: function() {
		return !this.needs_install()
			&& !this.needs_upgrade();
	},
	
	needs_install: function() {
		version = this._schema.version();
		return !version || version == '0.0';
	},
	
	needs_upgrade: function() {
		return this.needs_install() || this._schema.version() != this._schema.max_version();
	},
	
	run: function(on_complete, on_error) {
		
	
	
		if (this.ready()) {
			if (on_complete) on_complete();
		}
		else {
			on_complete = on_complete || Prototype.emptyFunction;
			on_error = on_error || Prototype.emptyFunction;
			this._update_schema(null, on_complete, on_error);
		}
	},
	
	_update_schema: function(version, on_complete, on_error) {
		version = version || this._schema.version();
		var migrator = this._schema.migrator(version);
		if (!migrator) {
			on_complete();
		}
		else {
			this._schema.update(migrator,
				this._on_schema_updated.bind(this, on_complete, on_error),
				this._on_schema_error.bind(this, on_complete, on_error)
			);
		}
	},
	
	_on_schema_updated: function(on_complete, on_error, version) {
//		$.trace('schema updated to', version);
		this._update_schema(version, on_complete, on_error);
	},

	_on_schema_error: function(on_complete, on_error, error) {
//		$.trace('error preparing schema:', error.message);
		on_error(error);
//		on_complete();
	}
});