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

Whendle.SchemaService = Class.create({
	initialize: function(database) {
		this._version = '0.0';
		this._database = database;
	},
	
	version: function() {
		return this._version;
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
				, new Whendle.DatabaseStatement('drop table \'clocks\'', [])
//					.complete(function() { $.trace('clocks dropped') })
//					.exception(function(e) { $.trace('could not drop clocks:', e.message) }),
			]
		);
	},

	migrator: function(version) {
		switch (version || this._version) {
			case '0.0':
				return new Whendle.Migrator_0_1(this._database);
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