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

Whendle.Timezone_Repository = Class.create({
	URL_TIMEZONE_BY_LOCATION: 'http://ws.geonames.org/timezoneJSON',

	initialize: function(tzloader) {
		this._tzloader = tzloader || new Whendle.TzLoader(new Whendle.AjaxService());
		this._cache = new Hash();
	},
	
	get_timezone: function(name, on_complete, on_error) {
		on_complete = on_complete || Prototype.emptyFunction;
		on_error = on_error || Prototype.emptyFunction;
		
		var zone = this.read_from_cache(name);
		if (zone) {
			on_complete(zone);
		}
		else {
			this.load_from_system(name, on_complete, on_error);
		}
	},
	
	read_from_cache: function(name) {
		return this._cache.get(name || '');
	},
	
	load_from_system: function(name, on_complete, on_error) {
		this._tzloader.load(
			name,
			this._on_load_result.bind(this, name, on_complete, on_error),
			this._on_load_error.bind(this, name, on_error)
		);
	},
	
	_on_load_result: function(name, on_complete, on_error, text) {
		var zone_reader = this._new_reader(text);
		var rules = [];
		var zones = [];
		
		zone = zone_reader.next_zone(name)
		while (zone != null) {
			zones.push(zone);
			
			var rule_reader = this._new_reader(text);
			var rule = rule_reader.next_rule(zone.RULES);

			while (rule != null) {
				var contains = rules.any(function(r) {
					return r.toString() == rule.toString();
				});
				
				if (!contains) {
					rules.push(rule);
				}
				
				rule = rule_reader.next_rule(zone.RULES);
			}
			
			zone = zone_reader.next_zone(name);
		}
		
		var timezone = new Whendle.Timezone(zones, rules);
		this.set_into_cache(name, timezone);
		on_complete(timezone);
	},
	
	set_into_cache: function(name, zone) {
		if (zone) {
			this._cache.set(name || '', zone);
		}
	},

	_new_reader: function(text) {
		return new Whendle.TzReader(text);
	},
	
	_on_load_error: function(name, on_error, error) {
		on_error(error);
	}
});