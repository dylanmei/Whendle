
Whendle.Migrator = Class.create({
	initialize: function(version, database) {
		this.version = version;
		this.database = database;
		this.jobs = [];
	},

	go: function(on_complete, on_error) {
		if (this.jobs.length == 0) {
			this._on_job_done(on_complete);
		}
		else {
			var jobs = this.jobs.clone();
			for (var i = 0; i < jobs.length; i++) {
				jobs[i](this.database);
			}
		}
	},

	queue_job: function(statement, parameters, on_complete, on_error, note) {
		var self = this;
		var job = function(db) {
			db.scalar(statement, parameters,
				self._on_job_done.bind(self, on_complete, note),
				on_error
			);
		}

		this.jobs.push(job);
	},

	_on_job_done: function(on_complete, note) {
		//$.trace(this.version, note);
		if (this.jobs.length != 0) {
			this.jobs.pop();
		}

		if (this.jobs.length == 0) {
			on_complete(this.version);
		}
	}
});

// When run the first time
Whendle.Migrator_0_1 = Class.create(Whendle.Migrator, {
	// as of Nov 2009
	DEFAULT_TIMEZONE: '{"name": "America/Los_Angeles", "zones": ["Zone America/Los_Angeles -7:52:58 -\tLMT\t1883 Nov 18 12:07:02", "Zone\tAmerica/Los_Angeles\t-8:00\tUS\tP%sT\t1946", "Zone\tAmerica/Los_Angeles\t-8:00\tCA\tP%sT\t1967", "Zone\tAmerica/Los_Angeles\t-8:00\tUS\tP%sT"], "rules": ["Rule\tUS\t1918\t1919\t-\tMar\tlastSun\t2:00\t1:00\tD", "Rule\tUS\t1918\t1919\t-\tOct\tlastSun\t2:00\t0\tS", "Rule\tUS\t1942\tonly\t-\tFeb\t9\t2:00\t1:00\tW", "Rule\tUS\t1945\tonly\t-\tAug\t14\t23:00u\t1:00\tP", "Rule\tUS\t1945\tonly\t-\tSep\t30\t2:00\t0\tS", "Rule\tUS\t1967\t2006\t-\tOct\tlastSun\t2:00\t0\tS", "Rule\tUS\t1967\t1973\t-\tApr\tlastSun\t2:00\t1:00\tD", "Rule\tUS\t1974\tonly\t-\tJan\t6\t2:00\t1:00\tD", "Rule\tUS\t1975\tonly\t-\tFeb\t23\t2:00\t1:00\tD", "Rule\tUS\t1976\t1986\t-\tApr\tlastSun\t2:00\t1:00\tD", "Rule\tUS\t1987\t2006\t-\tApr\tSun>=1\t2:00\t1:00\tD", "Rule\tUS\t2007\tmax\t-\tMar\tSun>=8\t2:00\t1:00\tD", "Rule\tUS\t2007\tmax\t-\tNov\tSun>=1\t2:00\t0\tS", "Rule\tCA\t1948\tonly\t-\tMar\t14\t2:00\t1:00\tD", "Rule\tCA\t1949\tonly\t-\tJan\t 1\t2:00\t0\tS", "Rule\tCA\t1950\t1966\t-\tApr\tlastSun\t2:00\t1:00\tD", "Rule\tCA\t1950\t1961\t-\tSep\tlastSun\t2:00\t0\tS", "Rule\tCA\t1962\t1966\t-\tOct\tlastSun\t2:00\t0\tS"]}',

	initialize: function($super, database) {
		$super('0.1', database);
	},

	go: function($super, on_complete, on_error) {
		this.queue_job('create table \'whendle\' (id integer primary key autoincrement not null, version text not null)', [],
			on_complete, on_error, 'create whendle table');
		this.queue_job('insert into \'whendle\' (version) values (\'0.1\')', [],
			on_complete, on_error, 'insert version 0.1');
		this.queue_job('create table \'places\' (id integer primary key autoincrement not null, name text not null, admin text, country text, latitude real, longitude real, timezone text, woeid integer, type integer)', [],
			on_complete, on_error, 'create places table');
		this.queue_job('insert into \'places\' (name,admin,country,latitude,longitude,timezone,woeid,type) values (?,?,?,?,?,?,?,?)',
			['Sunnyvale', 'California', 'United States', 37.371609, -122.038254, this.DEFAULT_TIMEZONE, 2502265, 7],
			on_complete, on_error, 'insert default place');
		$super(on_complete, on_error);
	}
});

Whendle.Migrator_0_2 = Class.create(Whendle.Migrator, {
	initialize: function($super, database) {
		$super('0.2', database);
	},

	go: function($super, on_complete, on_error) {
		this.queue_job('update \'whendle\' set version=?', ['0.2'],
			on_complete, on_error, 'update whendle table');
		this.queue_job('alter table \'places\' add \'sort\' integer default 0 not null', [],
			on_complete, on_error, 'alter places table');
		$super(on_complete, on_error);
	}
});
