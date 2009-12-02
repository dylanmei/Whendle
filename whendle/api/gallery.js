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

Whendle.Gallery.View = Class.create(Whendle.Observable, {
	initialize: function($super) {
		$super();
	},
	
	// 	event = {
	//		clocks: [{ id:#, name:'', place:'', time:'', day:'', latitude:#, longitude:# }],
	//		error: { message:'' }
	//	}
	loaded: function(event) {
	},
	
	// 	event = {
	//		clocks: [{ id:#, name:'', place:'', time:'', day:'', latitude:#, longitude:# }],
	//		error: { message:'' }
	//	}
	added: function(event) {
	},
	
	// 	event = {
	//		clocks: [{ id:# }],
	//		error: { message:'' }
	//	}
	removed: function(event) {
	},
	
	// 	event = {
	//		clocks: [{ id:#, name:'', place:'', time:'', day:'', latitude:#, longitude:# }],
	//		reason: '',
	//		error: { message:'' }
	//	}
	changed: function(event) {
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
		this._timekeeper.observe(Whendle.Events.timer,
			this._on_timekeeping_tick.bind(this, view));
	},
	
	_on_load_ready: function(view, event) {
		var timer = (event || {}).timer;
		this.load_clocks(view,
			this._on_clocks_loaded.bind(this, view, timer),
			function(error) { view.loaded({ 'clocks': [], 'error': error }) });
	},
	
	load_clocks: function(view, on_complete, on_error) {
		var self = this;
		this._database.rowset('select * from clocks', [],
			function(results) {
				if (!results) results = [];
				var clocks = results.collect(function(r) {
					return {
						'id': r.id,
						'name': r.location,
						'timezone': r.timezone,
						'place': self.format_place(r.location, r.district, r.country),
						'latitude': r.latitude,
						'longitude': r.longitude
					}
				});			
				on_complete(clocks);
			},
			on_error
		);
	},
	
	_on_clocks_loaded: function(view, timer, clocks) {
		var self = this;
		var wait = new Whendle.Wait(function() {
			view.loaded({ 'clocks': clocks });
			if (timer)
				self._timekeeper.start(timer);
		});
		
		var localtime = this._timekeeper.localtime();
		clocks.each(function(clock) {
			self.adjust_clock(clock, localtime, wait.on());
		});
		wait.ready();
	},
	
	adjust_clock: function(clock, localtime, on_complete) {
		var self = this;
		var on_timezone = function(timezone) {
			var when = self.offset_time(localtime, timezone);
			clock.time = self.format_time(when);
			clock.day = self.format_day(when);
			on_complete();
		};
		this._timezones.load(clock.timezone, on_timezone);
	},
	
	offset_time: function(localtime, timezone) {
		t = Date.from_object(localtime);
		t.addMinutes(-localtime.offset);
		t.addMinutes(timezone.offset(t));
		return t;
	},
	
	format_place: function(location, district, country) {
		return  district + ', ' + country;
	},

	format_time: function(t) {
		var hours = t.getHours().toString();
		var minutes = t.getMinutes().toPaddedString(2);
		
		var pattern = this._timekeeper.time_format();
		if (pattern == 'HH12') {
			var template = t.getHours() < 12 ? $.string('time_HH12am', '#{hours}:#{minutes} am') : $.string('time_HH12pm', '#{hours}:#{minutes} pm');
			return template.interpolate({ 'hours': (hours % 12 || 12), 'minutes': minutes });
		}
		
		return $.string('time_HH24', '#{hours}:#{minutes}').interpolate({ 'hours': hours, 'minutes': minutes });
	},
	
	format_day: function(d) {
		var today = Date.today();
		var day = d.copy();
		day.setMilliseconds(0);
		day.setSeconds(0);
		day.setMinutes(0);
		day.setHours(0);
		return day < today
			? $.string('day_Yesterday', 'Yesterday') : day > today
				? $.string('day_Tomorrow', 'Tomorrow') : $.string('day_Today', 'Today');
	},

	_on_add_clock: function(view, event) {
		if (!event) return;
		var location = event.location;

		this._timezones.lookup(
			location.latitude, location.longitude,
			this._on_timezone_result.bind(this, view, location),
			function(error) { view.added({ 'clocks': [], 'error': error }) }
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
			function(error) { view.added({ 'clocks': [], 'error': error }) }
		);
	},
	
	_on_clock_added: function(view, clock, identity) {
		var clocks = [{
			'id': identity,
			'name': clock.location,
			'timezone': clock.timezone,
			'place': this.format_place(clock.location, clock.district, clock.country),
			'latitude': clock.latitude,
			'longitude': clock.longitude
		}];

		var localtime = this._timekeeper.localtime();
		this.adjust_clock(clocks[0], localtime,
			function() { view.added({ 'clocks': clocks }); }
		);
	},
	
	_on_remove_clock: function(view, event) {
		if (!event) return;
		var id = event.id;
		
		if (id) {
			this._database.remove(
				'delete from clocks where id=?',
				[id],
				this._on_clock_removed.bind(this, view, id),
				function(error) { view.removed({ 'clocks': [], 'error': error }) }
			);
		}
	},
	
	_on_clock_removed: function(view, id) {
		view.removed({ 'clocks': [{ 'id': id }] });
	},
	
	_on_timekeeping_change: function(view, reason) {
		this.load_clocks(view,
			this.on_clocks_changed.bind(this, view, reason),
			function(error) { view.changed({ 'clocks': [], 'reason': reason, 'error': error }) });
	},
	
	_on_timekeeping_tick: function(view, localtime) {
		this._on_timekeeping_change(view, 'time');
	},
	
	on_clocks_changed: function(view, reason, clocks) {
		var wait = new Whendle.Wait(function() {
			view.changed({ 'clocks': clocks, 'reason': reason });
		});

		var self = this;
		var localtime = this._timekeeper.localtime();
		clocks.each(function(clock) {
			self.adjust_clock(clock, localtime, wait.on());
		});
		wait.ready();	
	}
});