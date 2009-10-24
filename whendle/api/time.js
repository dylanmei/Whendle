
Whendle.TzZone = Class.create({
	initialize: function(tz_data) {
		this._data = tz_data;
		this._values = null;
	},
	
	_parse: function() {
		if (this._values == null) {
			var regex = /(?:Zone)(?:\s(\w+\/[\w-]+))(?:\s+(-?\d+:\d+:?\d*))?(?:\s(\S+))?(?:\s(\S+))?(?:\s(.*))?/g;
			this._values = regex.exec(this._data);
		}
	}
});

with (Whendle.TzZone.prototype) {
	toString = function() { return this._data; }
	__defineGetter__('NAME', function() { this._parse(); return this._values[1]; });
	__defineGetter__('OFFSET', function() { this._parse(); return this._values[2]; });
	__defineGetter__('RULE', function() { this._parse(); return this._values[3]; });
	__defineGetter__('FORMAT', function() { this._parse(); return this._values[4]; });
	__defineGetter__('UNTIL', function() { this._parse(); return this._values[5]; });
}

Whendle.TzRule = Class.create({
	initialize: function(tz_data) {
		this._data = tz_data;
		this._values = null;
	},
	
	_parse: function() {
		if (this._values == null) {
			var regex = /Rule(?:\s+([^\t]+))(?:\s+(\d+))?(?:\s+(\d+|only|max))?(?:\s+([^\t]+))?(?:\s+([^\t]+))?(?:\s+([^\t]+))?(?:\s+([^\t]+))?(?:\s+([^\t]+))?(?:\s+([^\t]+))?/g;
			this._values = regex.exec(this._data);
		}
	}
});

with (Whendle.TzRule.prototype) {
	toString = function() { return this._data; }
	__defineGetter__('NAME', function() { this._parse(); return this._values[1]; });
	__defineGetter__('FROM', function() { this._parse(); return this._values[2]; });
	__defineGetter__('TO', function() { this._parse(); return this._values[3]; });
	__defineGetter__('TYPE', function() { this._parse(); return this._values[4]; });
	__defineGetter__('IN', function() { this._parse(); return this._values[5]; });
	__defineGetter__('ON', function() { this._parse(); return this._values[6]; });
	__defineGetter__('AT', function() { this._parse(); return this._values[7]; });
	__defineGetter__('SAVE', function() { this._parse(); return this._values[8]; });
	__defineGetter__('LETTERS', function() { this._parse(); return this._values[9]; });
}

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
	
	next_rule: function() {
		var line = null;
		var rule = null;
		while ((line = this._next_line()) != null) {
			if (line.startsWith('Rule')) {
				rule = line;
				break;
			}
		}
		
		return rule ? this._new_rule(rule) : null;
	},
	
	_new_rule: function(tz_data) {
		return new Whendle.TzRule(tz_data);
	},
	
	next_zone: function() {
		var line = null;
		var zone = null;
		while ((line = this._next_line()) != null) {
			if (line.startsWith('Zone')) {
				zone = line;
				this._zone = this._read_zone_name(zone);
				break;
			}
			else if (line.startsWith('\t\t\t')) {
				zone = line.replace('\t\t', 'Zone\t' + this._zone);
				break;
			}
		}
		
		return zone ? this._new_zone(zone) : null;
	},
	
	_new_zone: function(tz_data) {
		return new Whendle.TzZone(tz_data);
	},
	
	_read_zone_name: function(s) {
		return s.split(/\s+/)[1];
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