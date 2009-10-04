
Whendle.SchemaService = Class.create({
	initialize: function(database) {
		this.database = database;
	},
	
	read: function(on_complete, on_error) {
		on_error = on_error || Prototype.emptyFunction;
		on_complete = this._on_version_exists.bind(this, on_complete || Prototype.emptyFunction, on_error);
		
		// ensure the version exists
		this.database.scalar(
			'select count(1) from sqlite_master where type=\'table\' and name=\'whendle\'', [],
			on_complete,
			on_error
		);
	},
	
	update: function(migrator, on_complete, on_error) {
		on_error = on_error || Prototype.emptyFunction;
		on_complete = on_complete || Prototype.emptyFunction;
		
		// run the migrator
		migrator.go(on_complete, on_error);
	},
	
	destroy: function(on_complete, on_error) {
		this.database.scalar('drop table if exists \'whendle\'', [],
			on_complete || Prototype.emptyFunction,
			on_error || Prototype.emptyFunction
		);
	},

	migrator: function(version) {
		switch (version) {
			case '0.0':
				return new Whendle.Migrator_0_1(this.database);
		}
		
		return null;
	},
	
	_on_version_exists: function(on_complete, on_error, exists) {
		if (exists) {
			this.database.scalar('select version from whendle order by id desc limit 1', [],
				on_complete,
				on_error
			);
		}
		else {
			on_complete('0.0');
		}
	}
});