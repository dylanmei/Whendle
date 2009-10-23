
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
		
		return rule;
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
		
		return zone;
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