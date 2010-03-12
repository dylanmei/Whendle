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

Whendle.Place_Repository = Class.create({
	initialize: function(database) {
		this.database = database;
	},

	get_places: function(on_complete, on_error) {
		var mapper = this.map_record_to_place.bind(this);
		this.database.rowset('select * from places order by sort, id', [],
			function(results) {
				on_complete(
					results ? results.collect(mapper) : []
				);
			},
			on_error
		);
	},

	get_place: function(id, on_complete, on_error) {
		var mapper = this.map_record_to_place.bind(this);
		this.database.rowset('select * from places where id=?', [id],
			function(results) {
				var clock = null;
				results = results ? results.collect(mapper) : [];
				if (results.length) clock = results[0];
				on_complete(clock);
			},
			on_error
		);
	},

	map_record_to_place: function(r) {
		var place = new Whendle.Place(r.id);
		place.woeid = r.woeid;
		place.name = r.name;
		place.type = r.type;
		place.admin = r.admin;
		place.country = r.country;
		place.longitude = r.longitude;
		place.latitude = r.latitude;
		place.timezone =
			new Whendle.Timezone()
				.json(r.timezone);
		return place;
	},

	edit_place: function(place, on_complete, on_error) {
		this.database.scalar(
			'update places set name=?,admin=?,country=? where id=?',
			[
				place.name || '',
				place.admin || '',
				place.country || '',
				place.id
			],
			on_complete,
			on_error
		);
	},

	add_place: function(place, on_complete, on_error) {
		var tzdata = place.timezone.json();
		this.database.insert(
			'insert into places (name,admin,country,longitude,latitude,timezone,woeid,type,sort) values (?,?,?,?,?,?,?,?,?)',
			[
				place.name,
				place.admin,
				place.country,
				place.longitude,
				place.latitude,
				tzdata,
				place.woeid,
				place.type,
				1000
			],
			on_complete,
			on_error
		);
	},

	delete_place: function(id, on_success, on_error) {
		var on_remove = function() { on_success(); }
		this.database.remove('delete from places where id=?', [id], on_remove, on_error);
	},


	order_places: function(ordered_ids, on_success, on_error) {
		var on_ordered = function() { on_success(); }
		var batch = new Whendle.DatabaseBatch()
			.success(on_ordered)
			.exception(on_error);

		ordered_ids.each(function(id, index) {
			batch.statement('update places set sort=? where id=?', [index, id]);
		});

		this.database.execute(batch);
	}
});