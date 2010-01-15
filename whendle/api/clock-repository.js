// This file belongs to Whendle, a clock application for the Palm Pre
// http://github.com/dylanmei/Whendle

//
// Copyright (C) 2009-2010 Dylan Meissner (dylanmei@gmail.com)
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

Whendle.Clock_Repository = Class.create({
	initialize: function(database) {
		this.database = database;
	},
	
	get_clocks: function(on_complete, on_error) {
		var mapper = this.map_records_to_clocks.bind(this);
		this.database.rowset('select * from clocks', [],
			function(results) {
				on_complete(
					results ? results.collect(mapper) : []
				);
			},
			on_error
		);
	},
	
	get_clock: function(id, on_complete, on_error) {
		var mapper = this.map_records_to_clocks.bind(this);
		this.database.rowset('select * from clocks where id=?', [id],
			function(results) {
				var clock = null;
				results = results ? results.collect(mapper) : [];
				if (results.length) clock = results[0];
				on_complete(clock);
			},
			on_error
		);		
	},
	
	map_records_to_clocks: function(r) {
		return {
			'id': r.id,
			'name': r.location,
			'timezone': r.timezone,
			'place': Whendle.Clock.Format_place(r.location, r.district, r.country),
			'latitude': r.latitude,
			'longitude': r.longitude
		}
	},
	
	put_clock: function(timezone, location, on_complete, on_error) {
		this.database.insert(
			'insert into clocks (location,district,country,latitude,longitude,timezone,offset) values (?,?,?,?,?,?,?)',
			[
				location.name,
				location.district,
				location.country,
				location.latitude,
				location.longitude,
				timezone.name,
				timezone.offset
			],
			on_complete,
			on_error
		);	
	},
	
	delete_clock: function(id, on_complete, on_error) {
		this.database.remove('delete from clocks where id=?', [id], on_complete, on_error);	
	}
});