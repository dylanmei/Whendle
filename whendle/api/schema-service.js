
Whendle.SchemaService = Class.create({
	initialize: function(database) {
		this._version = '0.0';
		this._database = database;
	},

	version: function() {
		return this._version;
	},

	max_version: function() {
		return Whendle.schema_version;
	},

	up_to_date: function() {
		return this._version && this._version == max_version;
	},

	read: function(on_complete, on_error) {
		on_error = on_error || Prototype.emptyFunction;
		on_complete = this._on_version_exists.bind(this, on_complete || Prototype.emptyFunction, on_error);

		// ensure the version exists
		this._database.scalar(
			'select count(1) from sqlite_master where type=\'table\' and name=\'whendle\'', [],
			on_complete,
			on_error
		);
	},

	update: function(migrator, on_complete, on_error) {
		on_error = on_error || Prototype.emptyFunction;
		on_complete = on_complete || Prototype.emptyFunction;

		// run the migrator
		migrator.go(this._on_version_updated.bind(this, on_complete), on_error);
	},

	destroy: function() {
		this._version = '0.0';
		this._database.execute(
			[
				  new Whendle.DatabaseStatement('drop table \'whendle\'', [])
//					.complete(function() { $.trace('whendle dropped') })
//					.exception(function(e) { $.trace('could not drop whendle:', e.message) }),
				, new Whendle.DatabaseStatement('drop table \'places\'', [])
//					.complete(function() { $.trace('places dropped') })
//					.exception(function(e) { $.trace('could not drop places:', e.message) }),
			]
		);
	},

	migrator: function(version) {
		switch (version || this._version) {
			case '0.0':
				return new Whendle.Migrator_0_1(this._database);
			case '0.1':
				return new Whendle.Migrator_0_2(this._database);
		}

		return null;
	},

	_on_version_exists: function(on_complete, on_error, exists) {
		if (!exists) {
			on_complete(this._version);
			return;
		}

		this._database.scalar('select version from \'whendle\' order by id desc limit 1', [],
			this._on_select_version.bind(this, on_complete),
			on_error
		);
	},

	_on_select_version: function(on_complete, version) {
		this._version = version;
		on_complete(version);
	},

	_on_version_updated: function(on_complete, version) {
		this._version = version;
		on_complete(version);
	}
});