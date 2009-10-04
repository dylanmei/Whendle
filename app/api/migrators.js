
Whendle.Migrator = Class.create({
	initialize: function(version, database) {
		this.version = version;
		this.database = database;
		this.jobs = [];
	},
	
	queue: function(statement, parameters, on_complete, on_error, note) {
		var self = this;
		var job = function(db) {
				db.scalar(statement, parameters,
					self._on_job_done.bind(self, on_complete, note),
					on_error
				);
		}

		this.jobs.push(job);
	},
	
	go: function(on_complete, on_error) {
		var jobs = this.jobs.clone();
		for (var i = 0; i < jobs.length; i++) {
			jobs[i](this.database);
		}
	},
	
	_on_job_done: function(on_complete, note) {
		if (note) Mojo.Log.info(note);
		
		this.jobs.pop();
		if (this.jobs.length == 0) {
			on_complete(this.version);
		}
	}
});

// When run the first time
Whendle.Migrator_0_1 = Class.create(Whendle.Migrator, {
	initialize: function($super, database) {
		$super('0.1', database);
	},
	
	go: function($super, on_complete, on_error) {
	
		this.queue('create table if not exists whendle (id integer primary key autoincrement not null, version text not null)', [],
			on_complete, on_error, 'create table whendle');
		this.queue('insert into whendle (version) values (\'0.1\')', [],
			on_complete, on_error, 'insert version 0.1');
		
		$super(on_complete, on_error);
	}
});