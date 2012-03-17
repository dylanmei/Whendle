
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
			this.fire(Whendle.Timekeeper.Events.timer, this.now());
		}
		finally {
			this._executing = false;
		}
	}
});

Whendle.Timekeeper = {
	Events: { timer: ':timer', system: ':system' }
};

Whendle.TimekeeperService = Class.create(Whendle.Observable, {
	initialize: function($super, system) {
		$super();
		this.system = system || Whendle.system();
		this.timer = null;
		this.subscriptions;
		this.offset = 0;
		this.timezone = '';
		this.time = new Time();
		this.utc = new Time();
		this.format = '';
	},

	setup: function(on_complete, on_error) {
		this.subscriptions = {
			preferences: false,
			system_time: false,
			on_ready: on_complete || Prototype.emptyFunction
		};

		var on_preferences = this._on_preferences.bind(this);
		var on_system_time = this._on_system_time.bind(this);

		this._make_preferences_request(on_preferences);
		this._make_system_time_request(on_system_time);
	},

	start: function(timer) {
		this.timer = timer;
		timer.observe(Whendle.Timekeeper.Events.timer,
			this.on_timer_tick.bind(this));
		timer.start();
	},

	stop: function() {
		if (this.timer) this.timer.stop();
	},

	_on_preferences: function(response) {
		var first_time = this.format.empty();
		if (first_time || response.timeFormat != this.format) {
			this.format = response.timeFormat;
			if (!first_time)
				this.fire(Whendle.Timekeeper.Events.system, 'timeformat');
		}
		if (first_time) {
			this.on_subscribed('preferences');
		}
	},

	_on_system_time: function(response) {
		var lt = response.localtime;
		this.time
			.year(lt.year)
			.month(lt.month)
			.day(lt.day)
			.hour(lt.hour)
			.minute(lt.minute);

		this.utc = this.time
			.clone()
			.subtract(Time.minutes, response.offset);

		var first_time = this.timezone.empty();
		if (first_time || response.timezone != this.timezone) {
			this.timezone = response.timezone;
			this.offset = response.offset;
			if (!first_time)
				this.fire(Whendle.Timekeeper.Events.system, 'timezone');
		}
		if (first_time) {
			this.on_subscribed('system_time');
		}
	},

	_make_preferences_request: function(callback) {
		this.system.request('palm://com.palm.systemservice', {
			method: 'getPreferences',
			parameters: { 'subscribe': true, 'keys': [ 'timeFormat' ] },
			onSuccess: callback
		});
	},

	_make_system_time_request: function(callback) {
		this.system.request('palm://com.palm.systemservice/time', {
			method: 'getSystemTime',
			parameters: { 'subscribe': true },
			onSuccess: callback
		});
	},

	on_subscribed: function(which) {

		if (this.subscriptions[which]) return;
		this.subscriptions[which] = 1;

		if (this.subscriptions.preferences &&
			this.subscriptions.system_time) {

			this.subscriptions.on_ready();
		}
	},

	on_timer_tick: function(now) {
		now.second(0);
		if (now.compare(this.time) != 0) {
			this.time = now.clone();
			this.utc = now.clone()
				.subtract(Time.minutes, this.offset);
			this.fire(Whendle.Timekeeper.Events.timer, now);
		}
	}
});