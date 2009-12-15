SystemService = Class.create({
	initialize: function(zone, format) {
		this._timezone = zone;
		this._timeformat = format;
		this._pref_subscription = null;
		this._time_subscription = null;
	},
	
	request: function(uri, options) {
		if (options.method == 'getPreferences') {
			var callback = options.onSuccess;
			if (options.parameters.subscribe)
				this._pref_subscription = callback;
			callback({ 'timeFormat': this._timeformat });
			
		}
		if (options.method == 'getSystemTime') {
			var callback = options.onSuccess;
			if (options.parameters.subscribe)
				this._time_subscription = callback;

			var now = Time.now()
			callback({
				'timezone': this._timezone,
				'offset': -480,
				'localtime': {
					'year': now.year(),
					'month': now.month(),
					'day': now.day(),
					'hour': now.hour(),
					'minute': now.minute(),
					'second': now.second()
				}
			});
		}
	},
	
	timeformat: function(v) {
		if (v !== undefined && v != this._timeformat) {
			this._timeformat = v;
			if (this._pref_subscription)
				this._pref_subscription({ 'timeFormat': v });
		}
		return this._timeformat;
	},
	
	timezone: function(v) {
		if (v !== undefined && v != this._timezone) {
			this._timezone = v;
			if (this._time_subscription)
				this._time_subscription({ 'timezone': v });
		}
		return this._timezone;
	}
});