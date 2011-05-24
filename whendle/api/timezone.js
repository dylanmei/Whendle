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

Whendle.Timezone = Class.create({
	initialize: function(name, tz_zones, tz_rules) {
		this.name = name || '';
		this.zones = tz_zones || [];
		this.rules = tz_rules || [];
	},

	offset: function(date) {
		var minutes = 0;
		var zone = this.zone(date);
		if (zone) {
			minutes = this._parse_minutes(zone.GMTOFF);
			var rule = this.rule(zone.RULES, date);
			if (rule != null) {
				minutes += this._parse_minutes(rule.SAVE);
			}
		}

		return minutes;
	},

	_parse_minutes: function(s) {
		var parts = s.split(':');
		var time = [
			  Math.abs(parseInt(parts[0], 10))
			, parts.length > 1 ? parseInt(parts[1]) : 0
			, parts.length > 2 ? parseInt(parts[2]) : 0
		];

        var dir   = s[0] == '-' ? -1 : 1,
            value = ((time[0] * 60 + time[1]) * 60 + time[2]) / 60;
        return value * dir;
	},

	zone: function(date) {
		var zones = this.zones;
		var self = this;
		var year = date.getUTCFullYear();
		var value =  zones.find(function(z) {
			if (!z.UNTIL) return true;
			var until = self._parse_until(z.UNTIL);

			if (year < until.year) return true;
			if (year == until.year && until.day.after(date)) return true;
			return false;
		});

		return value || null;
	},

	_parse_until: function(s) {
		var rex = /^(\d+)\s?(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)?\s*(\w+)?\s*(\d+:\d+:?\d*)?([wsugz])?$/;
		var parts = rex.exec(s);
		return {
			year: parseInt(parts[1], 10),
			day: new Whendle.TzDay(parts[2], parts[3], parts[4])
		};
	},

	rule: function(name, date) {
		var rules = this.rules;
		rules = this._find_rules_by_name(rules, name);
		rules.sort(this._sort_rules_by_date.bind(this));

		var year = date.getUTCFullYear();

		// get rules for year before
		var prv_rules = this._find_rules_by_year(rules, year - 1);
		var prv_rule = this._get_nearest_rule(prv_rules, year - 1, date);

		// get rules for this year
		var now_rules = this._find_rules_by_year(rules, year);
		var now_rule = this._get_nearest_rule(now_rules, year, date);

		var rule = prv_rule;
		if (now_rule != null)
			rule = now_rule;

		return rule;
	},

	_find_rules_by_name: function(rules, name) {
		var rules = this._is_not_a_rule_name(name) ? [] : this.rules;
		return rules.select(function(r) { return r.NAME == name; });
	},

	_is_not_a_rule_name: function(name) {
		return !name || name.blank() || name == '';
	},

	_find_rules_by_year: function(rules, year) {
		return rules.reject(function(r) {
			if (r.from() > year) return true;
			if (r.to() < year) return true;
		});
	},

	_sort_rules_by_date: function(a, b) {
		return a.FROM != b.FROM
			? a.from() - b.from()
			: Whendle.TzDay.MONTHS[a.IN] - Whendle.TzDay.MONTHS[b.IN];
	},

	_get_nearest_rule: function(rules, year, date) {
		var found_rule = null;
		for (var i = 0; i < rules.length; i++) {
			var rule = rules[i];
			if (rule.from() > year) continue;

			var day = rule.day();
			var before = day.before(date, year);
			if (found_rule != null && !before)
				break;
			if (before)
				found_rule = rule;
		}
		return found_rule;
	},

	json: function(v) {
		if (Object.isUndefined(v)) {
			return Object.toJSON({
				name: this.name,
				zones: this.zones.collect(function(z) { return z.toString(); }),
				rules: this.rules.collect(function(r) { return r.toString(); })
			});
		}
		if (Object.isString(v)) {
			t = v.evalJSON();
			this.name = t.name;
			this.rules = t.rules.collect(function(s) { return new Whendle.TzRule(s); });
			this.zones = t.zones.collect(function(s) { return new Whendle.TzZone(s); });
		}

		return this;
	}
});
