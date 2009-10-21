// This file belongs to Whendle, a clock application for the Palm Pre
// http://github.com/dylanmei/Whendle

//
// Copyright (C) 2009 Dylan Meissner (dylanmei@gmail.com)
//
// Permission is hereby granted, free of charge, to any person otaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
// 
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

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
		if (note) $.trace(note);

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
	initialize: function($super, database) {
		$super('0.1', database);
	},
	
	go: function($super, on_complete, on_error) {
	
		this.queue_job('create table if not exists whendle (id integer primary key autoincrement not null, version text not null)', [],
			on_complete, on_error, 'create whendle table');
		this.queue_job('insert into whendle (version) values (\'0.1\')', [],
			on_complete, on_error, 'insert version 0.1');
		this.queue_job('create table if not exists clocks (id integer primary key autoincrement not null, location text not null, district text, country text, latitude real, longitude real, timezone text, offset intger)', [],
			on_complete, on_error, 'create clocks table');
		
		$super(on_complete, on_error);
	}
});