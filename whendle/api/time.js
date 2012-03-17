
Time = Class.create({
	initialize: function() {
		this._date = new Date(0);
	},

	toString: function() {
		return this.iso;
	},

	ticks: function(n) {
		if (n === undefined) return this._date.getTime();
		this._date = new Date(n);
		return this._millisecond(0);
	},

	date: function(d) {
		if (d === undefined) return this._date.copy();
		this._date = d.copy();
		return this._millisecond(0);
	},

	clone: function() {
		return new Time().ticks(this.ticks());
	},

	compare: function(t) {
		var t1 = this.ticks();
		var t2 = t.ticks();
		return t1 == t2 ? 0 : t1 < t2 ? -1 : 1;
	},

	add: function(t, n) {
		switch (t) {
			case Time.years:
				this._date.addYears(n); break;
			case Time.months:
				this._date.addMonths(n); break;
			case Time.days:
				this._date.addDays(n); break;
			case Time.hours:
				this._date.addHours(n); break;
			case Time.minutes:
				this._date.addMinutes(n); break;
			case Time.seconds:
				this._date.addSeconds(n); break;
		}
		return this;
	},

	subtract: function(t, n) {
		return this.add(t, -n);
	},

	year: function(n) {
		if (n === undefined) return this._date.getFullYear();
		this._date.setFullYear(n);
		return this;
	},

	month: function(n) {
		if (n === undefined) return this._date.getMonth() + 1;
		this._date.setMonth(n - 1);
		return this;
	},

	day: function(n) {
		if (n === undefined) return this._date.getDate();
		this._date.setDate(n);
		return this;
	},

	hour: function(n) {
		if (n === undefined) return this._date.getHours();
		this._date.setHours(n);
		return this;
	},

	minute: function(n) {
		if (n === undefined) return this._date.getMinutes();
		this._date.setMinutes(n);
		return this;
	},

	second: function(n) {
		if (n === undefined) return this._date.getSeconds();
		this._date.setSeconds(n);
		return this;
	},

	_millisecond: function(n) {
		if (n === undefined) return this._date.getMilliseconds();
		this._date.setMilliseconds(n);
		return this;
	},

	since: function(t) {
		var a = this.ticks();
		var b = t.ticks();
		var span = {
			minutes: 0,
			hours: 0,
			days:  0
		};

		if (b >= a) return span;
		span.minutes = Math.floor((a - b) / 60000);
		span.hours = Math.floor((a - b) / 3600000);
		span.days = Math.floor((a - b) / 86400000);
		return span;
	}
});

Time.years = 'years';
Time.months = 'months';
Time.days = 'days';
Time.hours = 'hours';
Time.minutes = 'minutes';
Time.seconds = 'seconds';

Time.now = function() {
	return new Time()
		.ticks(new Date().getTime());
}

Time.today = function() {
	return Time
		.now()
		.second(0)
		.minute(0)
		.hour(0);
}

Time.prototype.__defineGetter__('iso', function() {
	return this.year() + '-'
		+ this.month().toPaddedString(2) + '-'
		+ this.day().toPaddedString(2) + 'T'
		+ this.hour().toPaddedString(2) + ':'
		+ this.minute().toPaddedString(2) + ':'
		+ this.second().toPaddedString(2) + 'Z';
});

Date.prototype.copy = function() {
	return new Date(this.getTime());
}

Date.prototype.addYears = function(n) {
	 this.setFullYear(this.getFullYear() + n);
}

Date.prototype.addMonths = function(n) {
	this.setMonth(this.getMonth() + n, this.getDate());
}

Date.prototype.addDays = function(n) {
	this.setDate(this.getDate() + n);
}

Date.prototype.addHours = function(n) {
	this.setHours(this.getHours() + n);
}

Date.prototype.addMinutes = function(n) {
	this.setMinutes(this.getMinutes() + n, this.getSeconds(), this.getMilliseconds());
}

Date.prototype.addSeconds = function(n) {
	this.setSeconds(this.getSeconds() + n, this.getMilliseconds());
}

Time.angle_converter = new (
	Class.create({
		convert: function(time) {
			var DEGS_PER_MIN = 6.0;
			var DEGS_PER_HOUR = 30.0;
			var MIN_PER_HOUR = 60.0;

			var hour = typeof(time.hour) == 'function' ?  time.hour() : time.hour;
			var minute = typeof(time.minute) == 'function' ?  time.minute() : time.minute;

			return {
				hour: (hour % 12 * DEGS_PER_HOUR) + (minute * (DEGS_PER_HOUR / MIN_PER_HOUR)),
				minute: minute * DEGS_PER_MIN
			}
		}
	})
)();
