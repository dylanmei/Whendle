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
	//		now: { local: {}, utc: {}, hour_angle: #, declination: # },
	//		clocks: [{ id:#, title:'', subtitle:'', time:{}, display:'', day:'', latitude:#, longitude:# }],
	//		error: { message:'' }
	//	}
	loaded: function(event) {
	},
	
	// 	event = {
	//		now: { local: {}, utc: {}, hour_angle: #, declination: # },
	//		clocks: [{ id:#, title:'', subtitle:'', time:{}, display:'', day:'', latitude:#, longitude:# }],
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
	//		now: { local: {}, utc: {}, hour_angle: #, declination: # },
	//		clocks: [{ id:#, title:'', subtitle:'', time:{}, display:'', day:'', latitude:#, longitude:# }],
	//		reason: '',
	//		error: { message:'' }
	//	}
	changed: function(event) {
	}
});

Whendle.Gallery.Presenter = Class.create({
	initialize: function(view, timekeeper, timezone_locator, place_repository, sunlight_calculator) {
		this.timekeeper = timekeeper || Whendle.timekeeper();
		this.timezone_locator = timezone_locator || Whendle.timezone_locator();
		this.place_repository = place_repository || Whendle.place_repository();
		this.sunlight_calculator = sunlight_calculator || Whendle.sunlight_calculator();
		
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
		this.load(this.on_places_loaded.bind(this, view));
	},
	
	load: function(on_complete) {

		this.place_repository.get_places(
			on_complete,
			function(error) { view.loaded({ 'clocks': [], 'error': error }); });
	},

	on_places_loaded: function(view, places) {
		var result = this.pack_clocks_for_view(places);
		view.loaded(result);
	},
	
	pack_clocks_for_view: function(places) {
		var now = this.timekeeper.time;
		var utc = this.timekeeper.utc;
		var format = this.select_time_format();

		var self = this;
		var clocks = places.collect(function(p) {
			p.time = self.offset_time(utc, p.timezone);
			return {
				id: p.id,
				title: p.name,
				subtitle: Whendle.Place.Format_area(p),
				display: Whendle.Place.Format_time(p.time, format),
				day: Whendle.Place.Format_day(now, p.time),
				time: p.time,
				longitude: p.longitude,
				latitude: p.latitude
			}
		});
		
		var result = {
			now: {
				time: now,
				utc: utc
			},
			clocks: clocks
		};

		if (this.sunlight_calculator) {
			result.now.hour_angle = this.sunlight_calculator.hour_angle(utc);
			result.now.declination = this.sunlight_calculator.declination(utc);
		}
		return result;
	},
	
	select_time_format: function() {
		var format = null;
		if (Object.isFunction(Whendle.profile)) {
			var profile = Whendle.profile();
			format = profile.get('time_format');
		}

		return format || this.timekeeper.format;
	},
	
	offset_time: function(utc, timezone) {
		if (!timezone) return utc;
		return utc.clone()
			.add(Time.minutes, timezone.offset(utc.date()));
	},	
	
	_on_add_clock: function(view, event) {
		if (!event) return;
		var place = event.place;

		this.timezone_locator.lookup(
			place.latitude, place.longitude,
			this._on_timezone_result.bind(this, view, place),
			function(error) { view.added({ 'clocks': [], 'error': error }) }
		);
	},
	
	_on_timezone_result: function(view, place, timezone) {
		place.timezone = timezone;
		this.place_repository.add_place(place,
			this._on_clock_added.bind(this, view, place),
			function(error) { view.added({ 'clocks': [], 'error': error }) }
		);
	},
	
	_on_clock_added: function(view, place, identity) {
		place.id = identity;

		var result = this.pack_clocks_for_view([place]);
		view.added(result);
	},
	
	_on_remove_clock: function(view, event) {
		if (!event || !event.id) return;
		this.place_repository.delete_place(event.id,
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

		var result = this.pack_clocks_for_view(clocks);
		result.reason = reason;
		view.changed(result);
	}
});