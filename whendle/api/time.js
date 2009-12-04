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

Time = Class.create({
	initialize: function() {
		this._date = new Date();
		this._millisecond(0);
	},
	
	toString: function() {
		return this.ISO;
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
	}
});

Time.years = 'years';
Time.months = 'months';
Time.days = 'days';
Time.hours = 'hours';
Time.minutes = 'minutes';
Time.seconds = 'seconds';

Time.now = function() {
	return new Time();
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

// todo remove
Date.today = function() {
	var now = Date.current();
	now.setMilliseconds(0);
	now.setSeconds(0);
	now.setMinutes(0);
	now.setHours(0);
	return now;
}

// todo remove
Date.current = function() {
	return new Date();
}

// todo remove
Date.to_object = function(date) {
	return {
		'year': date.getFullYear(),
		'month': date.getMonth() + 1,
		'day': date.getDate(),
		'hour': date.getHours(),
		'minute': date.getMinutes(),
		'second': date.getSeconds()
	};
}

// todo remove
Date.from_object = function(obj) {
	return new Date(obj.year, obj.month - 1, obj.day, obj.hour, obj.minute, obj.second);
}

// todo remove
Date.prototype.copy = function() {
	return new Date(this.getTime());
}

// todo remove
Date.prototype.day = function() {
	var d = this.copy();
	d.setMilliseconds(0);
	d.setSeconds(0);
	d.setMinutes(0);
	d.setHours(0);
	return d;
}

// todo remove
Date.prototype.addYears = function(n) {
	 this.setFullYear(this.getFullYear() + n);
}
// todo remove
Date.prototype.addMonths = function(n) {
	this.setMonth(this.getMonth() + n, this.getDate());
}
// todo remove
Date.prototype.addDays = function(n) {
	this.setDate(this.getDate() + n);
}
// todo remove
Date.prototype.addHours = function(n) {
	this.setHours(this.getHours() + n);
}
// todo remove
Date.prototype.addMinutes = function(n) {
	this.setMinutes(this.getMinutes() + n, this.getSeconds(), this.getMilliseconds());
}
// todo remove
Date.prototype.addSeconds = function(n) {
	this.setSeconds(this.getSeconds() + n, this.getMilliseconds());
}

// todo remove
Date.prototype.__defineGetter__('ISO', function() {
	return this.getUTCFullYear() + '-'
		+ (this.getUTCMonth() + 1).toPaddedString(2) + '-'
		+ (this.getUTCDate()).toPaddedString(2) + 'T'
		+ (this.getUTCHours()).toPaddedString(2) + ':'
		+ (this.getUTCMinutes()).toPaddedString(2) + ':'
		+ (this.getUTCSeconds()).toPaddedString(2) + 'Z';
});

// todo remove
Date.prototype.__defineGetter__('Local', function() {
	return this.getFullYear() + '-'
		+ (this.getMonth() + 1).toPaddedString(2) + '-'
		+ (this.getDate()).toPaddedString(2) + ' '
		+ (this.getHours()).toPaddedString(2) + ':'
		+ (this.getMinutes()).toPaddedString(2) + ':'
		+ (this.getSeconds()).toPaddedString(2);	
});
