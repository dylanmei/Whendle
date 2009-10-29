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

Whendle.Timezone = Class.create({
	initialize: function(tz_zones, tz_rules) {
		this._zones = tz_zones;
		this._rules = tz_rules;
	},
	
	zone: function(date) {
		return this._get_zone(date);
	},
	
	rule: function(name, date) {
		return this._get_rule(name, date);
	},
	
	offset: function(date) {
		var zone = this._get_zone(date);
		var minutes = this._parse_minutes(zone.OFFSET);
		var rule = this._get_rule(zone.RULE, date);
		$.trace('rule', rule);
		
//		$.trace('zone:', zone);
//		$.trace('zone offset', zone.OFFSET, this._parse_minutes(zone.OFFSET));
//		var rule = this._get_rule(zone, date);
//		if (!rule) {
//			return zone.OFFSET;
//		}
//		return this._offset_from_rule(rule, date);
	},
	
	_get_zone: function(date) {
		var zones = this._zones;
		var self = this;
		var year = date.getUTCFullYear();
		var value =  zones.find(function(z) {
			if (!z.UNTIL) return true;

			var until = self._parse_until(z.UNTIL);

			if (year < until.year) return true;
			if (year == until.year && until.day.after(date)) return true;
		});

		return value || null;
	},
	
	_get_rule: function(name, date) {
		if (this._not_a_rule(name)) return null;
		
		// collect rules with the specified name
		var rules = this._rules.select(function(r) {
			return r.NAME == name;
		});

		var year = date.getUTCFullYear();
		rules = rules.reject(function(r) {
			var from = parseInt(r.FROM, 10);
			if (from > year) return true;
			if (r.TO == 'only') return from != year;
			if (r.TO == 'max') return year < from;
			return parseInt(r.TO, 10) < year;
		});

		// todo: try to determine if they are all pairs....?
		//$.trace('found', name, rules.length);

		var found = null;
		for (var i = 0; i < rules.length; i++) {
			var rule = rules[i];
			var day = new Whendle.TzDay(rule.IN, rule.ON, rule.AT);
			if (day.before(date)) {
				found = rule;
			}
		}
		return found;
	},
	
	_can_use_fall_rules: function(rule, year) {
		var from = parseInt(rule.FROM, 10);
		return from < year && rule.SAVE == '0';
	},
	
	_not_a_rule: function(name) {
		return !name || name.blank() || name == '';
	},

	_parse_until: function(s) {
		var rex = /^(\d+)\s?(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)?\s*(\w+)?\s*(\d+:\d+:?\d*)?([wsugz])?$/g;
		var parts = rex.exec(s);
		return {
			year: parseInt(parts[1], 10),
			day: new Whendle.TzDay(parts[2], parts[3], parts[4])
		};
	},
	
	_parse_minutes: function(s) {
		var parts = s.split(':');
		var time = [
			  parseInt(parts[0], 10)
			, parts.length > 1 ? parseInt(parts[1]) : 0
			, parts.length > 2 ? parseInt(parts[2]) : 0
		];
		
		return ((time[0] * 60 + time[1]) * 60 + time[2]) / 60;
	},
	
	_months: { 'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3,'May': 4, 'Jun': 5, 'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11 },
	_days: { 'Sun': 0,'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6 }
});

with (Whendle.Timezone.prototype) {
	__defineGetter__('name', function() { return this._zones.length ? this._zones[0].NAME : ''; });
}
