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

Whendle.TzZone = Class.create({
	initialize: function(tz_data) {
		this._data = tz_data;
		this._values = null;
	},

	_value: function(i) {
		if (this._values == null) this._parse();
		return this._values[i];
	},

	_parse: function() {
		var rex = /Zone(?:\s+(\w+\/[\w-]+\/?[\w-]*))(?:\s+(-?\d+:?\d*:?\d*))?(?:\s+(\S+))?(?:\s+(\S+))?(?:\s+(.*))?/;
		this._values = rex.exec(this._data);
	},

	toString: function() {
		return this._data;
	}
});

with (Whendle.TzZone.prototype) {
	toString = function() { return this._data; }
	__defineGetter__('NAME', function() { return this._value(1); });
	__defineGetter__('GMTOFF', function() { return this._value(2); });
	__defineGetter__('RULES', function() { return this._value(3); });
	__defineGetter__('FORMAT', function() { return this._value(4); });
	__defineGetter__('UNTIL', function() { return this._value(5); });
}

Whendle.TzRule = Class.create({
	initialize: function(tz_data) {
		this._data = tz_data;
		this._values = null;
	},

	_value: function(i) {
		if (this._values == null) this._parse();
		return this._values[i];
	},

	from: function() {
		return parseInt(this.FROM, 10);
	},

	to: function() {
		return this.TO == 'only' ?
			this.from() : this.TO == 'max' ?
				3333 : parseInt(this.TO, 10);
	},

	day: function() {
		return new Whendle.TzDay(this.IN, this.ON, this.AT);
	},

	_parse: function() {
		var rex = /Rule(?:\s+([^\s]+))(?:\s+(\d+))?(?:\s+(\d+|only|max))?(?:\s+(\S+))?(?:\s+(\S+))?(?:\s+(\S+))?(?:\s+(\d+:\d+))?(?:[wsugz])?(?:\s+(\d+:?\d*))?(?:\s+(\S+))?/;
		this._values = rex.exec(this._data);
	},

	toString: function() {
		return this._data;
	}
});

with (Whendle.TzRule.prototype) {
	toString = function() { return this._data; }
	__defineGetter__('NAME', function() { return this._value(1); });
	__defineGetter__('FROM', function() { return this._value(2); });
	__defineGetter__('TO', function() { return this._value(3); });
	__defineGetter__('TYPE', function() { return this._value(4); });
	__defineGetter__('IN', function() { return this._value(5); });
	__defineGetter__('ON', function() { return this._value(6); });
	__defineGetter__('AT', function() { return this._value(7); });
	__defineGetter__('SAVE', function() { return this._value(8); });
	__defineGetter__('LETTERS', function() { return this._value(9); });
}

Whendle.TzLink = Class.create({
	initialize: function(tz_data) {
		this._data = tz_data;
	},

	_value: function(i) {
		return (this._data || '')
			.split(/\s+/)[i];
	}
});

with (Whendle.TzLink.prototype) {
	toString = function() { return this._data; }
	__defineGetter__('NAME', function() { return this._value(2); });
	__defineGetter__('ZONE', function() { return this._value(1); });
}

Whendle.TzDay = Class.create({
	initialize: function(month, day, time) {
		this._m = month || '';
		this._d = day || '';
		this._t = time || '';
	},

	date: function(year) {
		var month = this._month();
		var day = this._day_of_month();
		var time = this._time();
		return new Date(year, month, day, time[0], time[1], time[2]);
	},

	empty: function() {
		return this._m.blank();
	},

	before: function(date, year) {
		return this._compare(date, year || date.getUTCFullYear()) == -1;
	},

	after: function(date, year) {
		return this._compare(date, year || date.getUTCFullYear()) == 1;
	},

	_compare: function(d, year) {
		var month = this._month();
		var date = this._day_of_month(year, month);
		var time = this._time();
		var when = new Date(year, month, date, time[0], time[1], time[2]);
		if (when < d) return -1;
		if (when > d) return 1;
		return 0;
	},

	_month: function() {
		return this._m.blank()
			? 11
			: Whendle.TzDay.MONTHS[this._m];
	},

	_day_of_month: function(year, month) {
		if (this._d.blank())
			return 31; // FIXME: last day in month?

		var code = this._d;
		var day, date, num = parseInt(code, 10);
		if (!isNaN(num))
			return num;

		if (code.startsWith('last')) {
			day = Whendle.TzDay.DAYS[code.substr(4)];
			date = new Date(Date.UTC(year, month + 1, 1));
			date.setUTCHours(-24);
			date.setUTCHours(date.getUTCHours() - 24 * ((7 - day + date.getUTCDay()) % 7));
			return date.getUTCDate();
		}
		else if (code.indexOf('>=') != -1) {
			day = Whendle.TzDay.DAYS[code.substr(0, 3)];
			num = parseInt(code.substr(5), 10);
			date = new Date(Date.UTC(year, month, num));
			date.setUTCHours(date.getUTCHours() + 24 * ((7 + day - date.getUTCDay()) % 7));
			return date.getUTCDate();
		}
		else if (code.indexOf('<=') != -1) {
			day = Whendle.TzDay.DAYS[code.substr(0, 3)];
			num = parseInt(code.substr(5), 10);
			date = new Date(Date.UTC(year, month, num));
			date.setUTCHours(date.getUTCHours() - 24 * ((7 - day + date.getUTCDay()) % 7));
			return date.getUTCDate();
		}

		return null;
	},

	_time: function() {
		if (this._t.blank())
			return [23, 59, 59];

		var parts = this._t.split(':');
		return [
			  parseInt(parts[0], 10)
			, parts.length > 1 ? parseInt(parts[1], 10) : 0
			, parts.length > 2 ? parseInt(parts[2], 10) : 0
		];
	}
});

Whendle.TzDay.DAYS = { 'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6 };
Whendle.TzDay.MONTHS = { 'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5, 'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11 };

Whendle.TzReader = Class.create({
	initialize: function(tz_data) {
		this._data = tz_data || '';
		this.reset();
	},

	reset: function() {
		this._pos = 0;
		this._zone = null;
	},

	next_line: function() {
		return this._next_line();
	},

	next_rule: function(name) {
		var line = null;
		var rule = null;
		while ((line = this._next_line()) != null) {
			if (line.startsWith('Rule')) {
				if (name && this._read_rule_name(line) != name) continue;
				rule = line;
				break;
			}
		}

		return rule ? this._new_rule(rule) : null;
	},

	_new_rule: function(tz_data) {
		return new Whendle.TzRule(tz_data);
	},

	_read_rule_name: function(s) {
		return s.split(/\s+/)[1];
	},

	zone: function(name) {
		this.reset();
		if (name === undefined) return null;

		return this.next_zone(name);
	},

	next_zone: function(name) {
		var line = null;
		var zone = null;

		while ((line = this._next_line()) != null) {
			if (line.startsWith('Zone')) {
				this._zone = this._read_zone_name(line);

				if (name && this._zone != name) continue;
				zone = line;
				break;
			}
			else if (line.startsWith('\t\t\t')) {
				if (name && this._zone != name) continue;

				zone = line.replace('\t\t', 'Zone\t' + this._zone);
				break;
			}
		}

		return zone ? this._new_zone(zone) : null;
	},

	link: function(name) {
		this.reset();
		if (name === undefined) return null;

		var line;
		while ((line = this._next_line()) != null) {
			if (line.startsWith('Link')) {
				var link = this._read_link_name(line);
				if (link == name)
					return new Whendle.TzLink(line);
			}
		}

		return null;
	},

	_new_zone: function(tz_data) {
		return new Whendle.TzZone(tz_data);
	},

	_read_zone_name: function(s) {
		return s.split(/\s+/)[1];
	},

	_read_link_name: function(s) {
		return s.split(/\s+/)[2];
	},

	_next_line: function() {
		var line = this._read_line();
		while (line != null) {
			if (this._is_valid_line(line))
				break;
			line = this._read_line();
		}

		if (line)
			line = this._strip_comments(line);
		return line;
	},

	_read_line: function() {
		if (this._pos >= this._data.length) {
			return null;
		}

		var end_index = this._data.indexOf('\n', this._pos);
		if (end_index == -1) {
			end_index = this._data.length;
		}

		var line = '';
		if (end_index != this._pos) {
			line = this._data.substring(this._pos, end_index);
		}

		this._pos = end_index + 1;
		return line;
	},

	_is_valid_line: function(line) {
		return line.length != 0 && line.charAt(0) != '#';
	},

	_strip_comments: function(line) {
		return line.replace(/(\s+)?#(\s+)?[^\n]+/, '');
	}
});

Whendle.TzLoader = Class.create({
	initialize: function(ajax, path) {
		this._ajax = ajax || new Whendle.AjaxService();
		this._path = path || 'tzdata';
	},

	load: function(zone, on_complete, on_error) {
		if (!Object.isString(zone)) return;

		this._load_file(zone, 0,
			on_complete || Prototype.emptyFunction,
			on_error || Prototype.emptyFunction
		);
	},

	_load_file: function(zone, index, on_complete, on_error) {
		var file = this._make_file_path(zone, index);
		if (file == '') {
			this._zone_does_not_exist(zone, on_error);
			return;
		}

		this._ajax.load(file,
			this._on_file_loaded.bind(this, zone, index, on_complete, on_error),
			this._on_file_error.bind(this, zone, file, on_error)
		);
	},

	_make_file_path: function(zone, search_index) {
		var area = this._parse_area(zone);
		var files = this._area_to_file[area];

		if (Object.isUndefined(files)) {
			return '';
		}

		var file = files[search_index];
		var path = this._path.endsWith('/') ? this._path : this._path + '/';
		return path + file;
	},

	_parse_area: function(zone) {
		return zone.split('/')[0];
	},

	_on_file_loaded: function(zone, file_index, on_complete, on_error, contents) {
		if (contents == '') {
			this._on_file_error(
				zone,
				this._make_file_path(zone, file_index),
				on_error
			);
			return;
		}

		if (this._zone_in_contents(zone, contents)) {
			on_complete(contents);
		}
		else {
			file_index++;
			var area = this._parse_area(zone);
			var files = this._area_to_file[area];
			if (file_index < files.length) {
				this._load_file(zone, file_index, on_complete, on_error);
			}
			else {
				this._zone_does_not_exist(zone, on_error);
			}
		}
	},

	_zone_in_contents: function(zone, text) {
		if (zone.endsWith('/*')) zone = zone.split('/')[0];
		var rex = new RegExp("^(Link\\s\\w+/\\w+|Zone)\\s" + zone + "+(\\s|$)+", "m");
		return rex.test(text);
	},

	_zone_does_not_exist: function(zone, callback) {
		callback({ 'message': zone + ' does not exist' });
	},

	_on_file_error: function(zone, file, on_error, error) {
		error = error || { message: 'file does not exist.' }
		error.timezone = zone;
		error.file = file;
		on_error(error);
	},

	_area_to_file: {
		  'Africa': ['africa', 'europe']
		, 'Indian': ['africa', 'asia', 'antarctica', 'australasia']
		, 'Antarctica': ['antarctica']
		, 'Asia': ['asia', 'europe']
		, 'Australia': ['australasia']
		, 'Pacific': ['australasia', 'northamerica', 'southamerica']
		, 'Atlantic': ['europe', 'africa', 'northamerica', 'southamerica']
		, 'Europe': ['europe']
		, 'WET': ['europe']
		, 'CET': ['europe']
		, 'MET': ['europe']
		, 'EET': ['europe']
		, 'EST': ['northamerica']
		, 'MST': ['northamerica']
		, 'HST': ['northamerica']
		, 'EST5EDT': ['northamerica']
		, 'CST6CDT': ['northamerica']
		, 'MST7MDT': ['northamerica']
		, 'PST8PDT': ['northamerica']
		, 'America': ['northamerica', 'southamerica', 'europe']
		, 'Arctic': ['europe']
	}
});