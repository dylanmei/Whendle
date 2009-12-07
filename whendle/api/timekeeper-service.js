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

Whendle.Timer = Class.create(Whendle.Observable, {
	initialize: function($super, window) {
		$super();
		this.window = window;
		this.frequency = 250;
		this._executing = false;
	},
	
	now: function() {
		return Time.now();
	},

	start: function() {
		this.timer = this.window.setInterval(
			this.on_interval.bind(this), this.frequency);
	},

	stop: function() {
		if (this.timer) {
			this.window.clearInterval(this.timer);
			this.timer = null
		}
	},

	on_interval: function() {
		if (this._executing) return;
		try {
			this._executing = true;
			this.fire(Whendle.Events.timer, this.now());
		}
		finally {
			this._executing = false;
		}
	}
});

Whendle.TimekeeperService = Class.create(Whendle.Observable, {
	initialize: function($super, system) {
		$super();
		this._system = system || new Whendle.PalmService();
		this._offset = 0;
		this._time = new Time();
		this._timer = null;
		this._format = null;
		this._timezone = null;
	},
	
	setup: function(on_complete, on_error) {
		var self = this;
		var wait = new Whendle.Wait(on_complete);
		var on_preferences = wait.on(this._on_preferences.bind(this, 'setup'));
		var on_system_time = wait.on(this._on_system_time.bind(this, 'setup'));
		
		this._make_preferences_request(on_preferences);
		this._make_system_time_request(on_system_time);
		
		wait.ready();
	},
	
	start: function(timer) {
		this.timer = timer;
		timer.observe(Whendle.Events.timer,
			this.on_timer_tick.bind(this));
		timer.start();
	},
	
	stop: function() {
		if (this.timer) this.timer.stop();
	},
	
	_on_preferences: function(call_state, response) {
		if (call_state == 'setup') {
			this._format = response.timeFormat;
			// first time, so subscribe
			this._make_preferences_request.bind(this).defer(
				this._on_preferences.bind(this, 'update'), true);
		}
		else {
			if (response.timeFormat != this._format) {
				this._format = response.timeFormat;
				this.fire(Whendle.Events.system, 'timeformat');
			}
		}
	},
	
	_on_system_time: function(call_state, response) {
		var lt = response.localtime;
		this._time
			.year(lt.year)
			.month(lt.month)
			.day(lt.day)
			.hour(lt.hour)
			.minute(lt.minute);
		this._offset = response.offset;

		if (call_state == 'setup') {
			this._timezone = response.timezone;
			// first time, so subscribe
			this._make_system_time_request.bind(this).defer(
				this._on_system_time.bind(this, 'update'), true);
		}
		else {
			if (response.timezone != this._timezone) {
				this._timezone = response.timezone;
				this.fire(Whendle.Events.system, 'timezone');
			}
		}
	},
	
	_make_preferences_request: function(callback, subscribe) {
		this._system.request('palm://com.palm.systemservice', {
			method: 'getPreferences',
			parameters: { 'subscribe': subscribe || false, 'keys': [ 'timeFormat' ] },
			onSuccess: callback
		});
	},
	
	_make_system_time_request: function(callback, subscribe) {
		this._system.request('palm://com.palm.systemservice/time', {
			method: 'getSystemTime',
			parameters: { 'subscribe': subscribe || false },
			onSuccess: callback
		});
	},
	
	on_timer_tick: function(now) {
		now.second(0);
		if (now.compare(this._time) != 0) {
			this._time = now.clone();
			this.fire(Whendle.Events.timer, now);
		}
	},
	
	time: function() {
		return this._time;
	},
	
	offset: function() {
		return this._offset;
	},
	
	zone: function() {
		return this._timezone;
	},
	
	format: function() {
		return this._format;
	}
});