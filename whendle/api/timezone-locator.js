
Whendle.Timezone_Locator = Class.create({

	initialize: function(ajax, tzloader) {
		this.ajax = ajax || new Whendle.AjaxService();
		this.loader = tzloader || new Whendle.TzLoader(this.ajax);
	},

	lookup: function(latitude, longitude, on_complete, on_error) {
		on_complete = on_complete || Prototype.emptyFunction;
		on_error = on_error || Prototype.emptyFunction;

		this.ajax.load(
			this._make_lookup_url(latitude, longitude),
			this._on_lookup_result.bind(this, on_complete, on_error),
			this._on_lookup_error.bind(this, on_error)
		);
	},

	_make_lookup_url: function(latitude, longitude) {
		return GeoNames.timezone_url(latitude, longitude);
	},

	_on_lookup_result: function(on_complete, on_error, response) {
		if (this.is_service_error(response)) {
			this.on_service_error(response, on_error);
		}
		else {
			this.load(response.timezoneId, on_complete, on_error);
		}
	},

	is_service_error: function(response) {
		return Object.isUndefined(response.timezoneId);
	},

	on_service_error: function(response, on_error) {
		var status = response.status;
		var error = { code: 0 };
		if (Object.isUndefined(status)) {
			error.message = 'Unknown service error';
		}
		else {
			error.code = status.value;
			error.message = status.message;
		}

		on_error(error);
	},

	_on_lookup_error: function(on_error, error) {
		on_error(error);
	},

	load: function(name, on_complete, on_error) {
		on_complete = on_complete || Prototype.emptyFunction;
		on_error = on_error || Prototype.emptyFunction;

		this.load_from_disk(name, on_complete, on_error);
	},

	load_from_disk: function(name, on_complete, on_error) {
		this.loader.load(
			name,
			this.on_load_result.bind(this, name, on_complete, on_error),
			this.on_load_error.bind(this, name, on_error)
		);
	},

	on_load_result: function(name, on_complete, on_error, text) {
		var zone_reader = this.new_reader(text);
		var rules = [];
		var zones = [];

		var zone = zone_reader.zone(name);
		if (zone == null) {
			var link = zone_reader.link(name);
			if (link != null) {
				zone = zone_reader.zone(link.ZONE);
			}
		}

		while (zone != null) {
			zones.push(zone);

			var rule_reader = this.new_reader(text);
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

			zone = zone_reader.next_zone(zone.NAME);
		}

		on_complete(new Whendle.Timezone(name, zones, rules));
	},

	new_reader: function(text) {
		return new Whendle.TzReader(text);
	},

	on_load_error: function(name, on_error, error) {
		on_error(error);
	}
});