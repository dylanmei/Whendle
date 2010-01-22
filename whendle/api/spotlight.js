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
	
	id: function() {
	},
	
	// 	event = {
	//		clock: { id:#, title:'', subtitle:'', display:'', day:'' },
	//		error: { message:'' }
	//	}
	clock_loaded: function() {
	},
	
	clock_unloaded: function() {
	},
	
	// 	event = {
	//		clock: { id:#, title:'', subtitle:'', display:'', day:'' },
	//		reason: '',
	//		error: { message:'' }
	//	}
	clock_changed: function(event) {
	}
});

Whendle.Spotlight.Presenter = Class.create({
	initialize: function(view, timekeeper, place_repository) {
		this.timekeeper = timekeeper || Whendle.timekeeper();
		this.place_repository = place_repository || Whendle.place_repository();

		view.observe(Whendle.Event.loading, this.on_loading.bind(this, view));
		view.observe(Whendle.Event.unloading, this.on_unloading.bind(this, view));

		this.tick_handler = this.on_timekeeping_tick.bind(this, view);
		this.system_handler = this.on_timekeeping_change.bind(this, view);
		this.timekeeper.observe(Whendle.Event.timer, this.tick_handler);
		this.timekeeper.observe(Whendle.Event.system, this.system_handler);
	},
	
	on_unloading: function(view) {
		this.timekeeper.ignore(Whendle.Event.timer, this.tick_handler);
		this.timekeeper.ignore(Whendle.Event.system, this.system_handler);
		view.clock_unloaded();
	},

	on_loading: function(view, event) {
		view.clock_loaded();
	},
	
	on_timekeeping_tick: function(view, time) {
		this.on_timekeeping_change(view, 'time');
	},
	
	on_timekeeping_change: function(view, reason) {
		var self = this;
		var now = this.timekeeper.time;
		var format = this.timekeeper.format;

		var on_ready = function(place) {
			var clock = {
				id: place.id,
				title: place.name,
				subtitle: Whendle.Place.Format_area(place),
				display: Whendle.Place.Format_time(place.time, format),
				day: Whendle.Place.Format_day(now, place.time)
			}
			
			view.clock_changed({ 'clock': clock, 'reason': reason })
		};

		var on_load = function(place) {
			self.adjust_clock(place, on_ready);
		}

		var on_error = function(e) {
			$.trace(e.message);
		}
		
		this.load_clock(view.id(), on_load, on_error);
	},
	
	adjust_clock: function(clock, on_complete) {

		
		this.timekeeper.offset_time(clock.timezone,
			function(time) {
				clock.time = time;
				on_complete(clock);
			}
		);
	},

	load_clock: function(id, on_complete, on_error) {
		this.place_repository.get_place(id, on_complete, on_error);
	}
});