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

Whendle.Gallery = {
};

Whendle.Gallery.View = Class.create(Whendle.View, {
	initialize: function($super) {
		$super();
	},
	
	// e = { clocks: [{}], format: '' }
	loaded: function(event, error) {
	},
	
	// e = { clock: {}, format: '' }
	added: function(event, error) {
	},
	
	// e = { id: # }
	removed: function(event, error) {
	},
	
	// e = { clock: {}, format: '' }
	updated: function(event, error) {
	},
	
	// e = { reason: '' }
	refresh: function(event) {
	}
});

Whendle.Gallery.Presenter = Class.create({
	URL_TIMEZONE_BY_LOCATION: 'http://ws.geonames.org/timezoneJSON',

	initialize: function(view, timekeeper, timezones, database) {
		this._timekeeper = timekeeper || Whendle.timekeeper();
		this._timezones = timezones || Whendle.timezones();
		this._database = database || Whendle.database();

		view.observe(Whendle.Events.loading,
			this._on_load_ready.bind(this, view));
		view.observe(Whendle.Events.adding,
			this._on_add_clock.bind(this, view));
		view.observe(Whendle.Events.removing,
			this._on_remove_clock.bind(this, view));
			
		this._timekeeper.observe(Whendle.Events.system,
			this._on_timekeeping_change.bind(this, view));
	},
	
	_on_load_ready: function(view) {
		this._database.rowset('select * from clocks', [],
			this._on_clocks_loaded.bind(this, view),
			this._on_load_error.bind(this, view)
		);
	},
	
	_on_clocks_loaded: function(view, results) {
		if (!results)
			results = [];

		results = results.collect(this._map_record_to_clock.bind(this));
		var format = this._timekeeper.time_format();
		view.loaded({ 'clocks': results, 'format': format });
		
		this._sync_timezone_offsets(results,
			function(clock) {
				view.updated({ 'clock': clock, 'format': format })
			});
	},
	
	_map_record_to_clock: function(data) {
		return new Whendle.Clock(
			data.id,
			data.timezone,
			data.offset,
			new Whendle.Location(
				data.location,
				data.district,
				data.country,
				data.latitude,
				data.longitude
			)
		);
	},
	
	_sync_timezone_offsets: function(clocks, notify_change) {
		var now = Date.current();
		var service = this._timezones;
		clocks.each(function(clock) {
			service.load(
				clock.timezone,
				function(tz) {
					var offset = tz.offset(now);
					if (offset != clock.offset) {
						clock.offset = offset;
						if (notify_change)
							notify_change(clock);
					}
				},
				function(e) { $.trace(e.message); }
			);
		});	
	},
	
	_on_load_error: function(view, error) {
		view.loaded({}, error);
	},
	
	_on_add_clock: function(view, event) {
		if (!event) return;
		var location = event.location;
		this._timezones.lookup(
			location.latitude, location.longitude,
			this._on_timezone_result.bind(this, view, location),
			this._on_add_error.bind(this, view)
		);
	},
	
	_on_timezone_result: function(view, location, timezone) {
		var clock = new Whendle.Clock(
			0,
			timezone.name,
			timezone.offset,
			location
		);
		
		this._database.insert(
			'insert into clocks (location,district,country,latitude,longitude,timezone,offset) values (?,?,?,?,?,?,?)',
			[
				location.name,
				location.district,
				location.country,
				location.latitude,
				location.longitude,
				clock.timezone,
				clock.offset
			],
			this._on_clock_added.bind(this, view, clock),
			this._on_add_error.bind(this, view)
		);
	},
	
	_on_clock_added: function(view, clock, identity) {
		clock.id = identity;
		var format = this._timekeeper.time_format();
		this._timezones.load(
			clock.timezone,
			function(tz) {
				clock.offset = tz.offset(Date.current());
				view.added({ 'clock': clock, 'format': format });
			}
		);
	},
	
	_on_add_error: function(view, error) {
		view.added({}, error);
	},
	
	_on_remove_clock: function(view, event) {
		if (!event) return;
		var id = event.id || ((event.clock) ? event.clock.id : 0);
		if (id) {
			this._database.remove(
				'delete from clocks where id=?',
				[id],
				this._on_clock_removed.bind(this, view, id),
				this._on_remove_error.bind(this, view)
			);
		}
	},
	
	_on_clock_removed: function(view, id) {
		view.removed({ 'id': id });
	},
	
	_on_remove_error: function(view, error) {
		view.removed({}, error);
	},
	
	_on_timekeeping_change: function(view, reason) {
		view.refresh({
			'reason': reason,
			'format': this._timekeeper.time_format()
		});
	}
});