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

Whendle.Spotlight = {
};

Whendle.Spotlight.View = Class.create(Whendle.Observable, {
	initialize: function($super) {
		$super();
	},
	
	// 	event = {
	//		clock: { id:#, title:'', subtitle:'', display:'', day:'' },
	//		error: { message:'' }
	//	}
	loaded: function(event) {
	},
	
	// 	event = {
	//		clock: { id:#, title:'', subtitle:'', display:'', day:'' },
	//		reason: '',
	//		error: { message:'' }
	//	}
	changed: function(event) {
	}
});

Whendle.Spotlight.Presenter = Class.create({
	initialize: function(view, timekeeper, place_repository) {
		this.timekeeper = timekeeper || Whendle.timekeeper();
		this.place_repository = place_repository || Whendle.place_repository();

		view.observe(Whendle.Event.loading, this.on_loading.bind(this, view));
	},
	
	destroy: function() {
		if (this.tick_handler)
			this.timekeeper.ignore(Whendle.Event.timer, this.tick_handler);
		if (this.system_handler)
			this.timekeeper.ignore(Whendle.Event.system, this.system_handler);
	},

	on_loading: function(view, event) {
		this.destroy();
		this.wire_timekeeper(view, event.id);
		
		var on_error = function(e) {
			$.trace(e.message);
		}

		var on_complete = function(view_data) {
			view.loaded(view_data);
		}
		
		this.load(event.id, on_complete, on_error);
	},

	wire_timekeeper: function(view, id) {
		this.timekeeper.observe(Whendle.Event.timer,
			this.tick_handler = this.on_timekeeping_tick.bind(this, view, id));
		this.timekeeper.observe(Whendle.Event.system,
			this.system_handler = this.on_timekeeping_change.bind(this, view, id));
	},
	
	load: function(id, on_complete, on_error) {
		var self = this;
		var now = this.timekeeper.time;
		var format = this.timekeeper.format;

		var on_loaded = function(place) {
			self.adjust_clock(place, function(place) {
				var view_data = self.pack_clock_for_view(place, now, format);
				on_complete(view_data);
			})
		}
		
		this.place_repository.get_place(id, on_loaded, on_error)
	},
	
	on_timekeeping_tick: function(view, id, time) {
		this.on_timekeeping_change(view, id, 'time');
	},
	
	on_timekeeping_change: function(view, id, reason) {

		var on_error = function(e) {
			$.trace(e.message);
		}

		var on_complete = function(view_data) {
			view_data.reason = reason;
			view.changed(view_data);
		}
		
		this.load(id, on_complete, on_error);
	},
	
	pack_clock_for_view: function(place, now, format) {
		return {
			clock: {
				id: place.id,
				title: place.name,
				subtitle: Whendle.Place.Format_area(place),
				display: Whendle.Place.Format_time(place.time, format),
				day: Whendle.Place.Format_day(now, place.time),
				longitude: place.longitude,
				latitude: place.latitude
			}
		};
	},	
	
	adjust_clock: function(clock, on_complete) {
		this.timekeeper.offset_time(clock.timezone,
			function(time) {
				clock.time = time;
				on_complete(clock);
			}
		);
	}
});