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

	initialize: function(view, timekeeper, timezone_locator, clock_repository) {
		this.timekeeper = timekeeper || Whendle.timekeeper();
		this.timezone_locator = timezone_locator || Whendle.timezone_locator();
		this.clock_repository = clock_repository || Whendle.clock_repository();
		
		view.observe(Whendle.Event.loading,
			this.on_loading.bind(this, view));
		view.observe(Whendle.Event.adding,
			this._on_add_clock.bind(this, view));
		view.observe(Whendle.Event.removing,
			this._on_remove_clock.bind(this, view));

		this.timekeeper.observe(Whendle.Event.system,
			this._on_timekeeping_change.bind(this, view));
		this.timekeeper.observe(Whendle.Event.timer,
			this._on_timekeeping_tick.bind(this, view));
	},

	on_loading: function(view) {
		this.load(this.on_clocks_loaded.bind(this, view));
	},
	
	load: function(on_complete) {
		this.clock_repository.get_clocks(
			on_complete,
			function(error) { view.loaded({ 'clocks': [], 'error': error }); });
	},

	on_clocks_loaded: function(view, clocks) {
		
		var on_ready = function() {
			view.loaded({ 'clocks': clocks });
		}
		
		var wait = new Whendle.Wait(on_ready);
		var self = this;

		clocks.each(function(clock) {
			self.adjust_clock(clock, wait.on());
		});
		wait.ready();
	},
	
	adjust_clock: function(clock, on_complete) {
		var now = this.timekeeper.time;
		var format = this.timekeeper.format;
		
		this.timekeeper.offset_time(clock.timezone,
			function(time) {
				clock.time = Whendle.Clock.Format_time(time, format);
				clock.day = Whendle.Clock.Format_day(now, time);
				on_complete(clock);
			}
		);
	},

	_on_add_clock: function(view, event) {
		if (!event) return;
		var location = event.location;

		this.timezone_locator.lookup(
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

		this.clock_repository.put_clock(timezone, location,
			this._on_clock_added.bind(this, view, clock),
			function(error) { view.added({ 'clocks': [], 'error': error }) }
		);
	},
	
	_on_clock_added: function(view, clock, identity) {
		var clocks = [{
			'id': identity,
			'name': clock.location,
			'timezone': clock.timezone,
			'place': Whendle.Clock.Format_place(clock.location, clock.district, clock.country),
			'latitude': clock.latitude,
			'longitude': clock.longitude
		}];

		this.adjust_clock(clocks[0],
			function() { view.added({ 'clocks': clocks }); }
		);
	},
	
	_on_remove_clock: function(view, event) {
		if (!event || !event.id) return;
		this.clock_repository.delete_clock(event.id,
			this._on_clock_removed.bind(this, view, event.id),
			function(error) { view.removed({ 'clocks': [], 'error': error }) }
		);
	},
	
	_on_clock_removed: function(view, id) {
		view.removed({ 'clocks': [{ 'id': id }] });
	},
	
	_on_timekeeping_change: function(view, reason) {
		this.load(this.on_clocks_changed.bind(this, view, reason));
	},
	
	_on_timekeeping_tick: function(view, time) {
		this._on_timekeeping_change(view, 'time');
	},
	
	on_clocks_changed: function(view, reason, clocks) {
		var wait = new Whendle.Wait(function() {
			view.changed({ 'clocks': clocks, 'reason': reason });
		});

		var self = this;
		clocks.each(function(clock) {
			self.adjust_clock(clock, wait.on());
		});
		wait.ready();	
	}
});