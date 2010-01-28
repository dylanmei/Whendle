
Weather_Slide = Class.create({

	CELCIUS: 'c',
	FARENHEIT: 'f',
	
	initialize: function() {
		this.div = new Element('div', { 'class': 'weather-slide-tray' });
	},
	
	setup: function(clock) {
		this.woeid = clock.woeid;

		// in contrast providing random content, this slide cycles through
		// the current weather, today's forcast, and tomorrow's forecast
		this.cycle = 0;
		this.generations = 0;
	},

	tray: function() {
		return this.div;
	},
	
	backdrop: function() {
	},
	
	invoke: function(on_ready) {
		var weather = (this.data || {}).weather;
		var attribution = (this.data || {}).attribution;

		switch (this.cycle) {
			case 1:
				this.compose_forecast('today', weather.today, attribution);
				on_ready(this.tray(), this.backdrop());
				this.cycle = 2;
				break;
			case 2:
				this.compose_forecast('tomorrow', weather.tomorrow, attribution);
				on_ready(this.tray(), this.backdrop());
				this.cycle = 0;
				break;
			default:
				if (this.generations < 1) {
					this.generations = 10;
					new Whendle.Weather_Agent(this.woeid).get(
						this.on_weather_value.bind(this, on_ready),
						this.on_weather_error.bind(this, on_ready)
					);
				}
				else {
					this.generations--;
					this.compose_weather(weather, attribution);
					on_ready(this.tray(), this.backdrop());
				}
				this.cycle = 1;
				break;
		}
	},
	
	clear_tray: function() {
		this.div.childElements()
			.each(function(c) { c.remove(); });
	},
	
	on_weather_value: function(on_ready, data) {
		this.data = data;
		this.compose_weather(data.weather, data.attribution);
		on_ready(this.tray(), this.backdrop());
	},

	on_weather_error: function(on_ready) {
		this.clear_tray();
		this.div.insert(new Element('div', { 'class': 'error' })
			.update('Weather service unreachable'));
		
		on_ready(this.tray());
	},
	
	compose_weather: function(weather, attribution) {
		this.clear_tray();
		this.div.insert(
			this.new_weather_element(weather.code, weather.temp));
		this.div.insert(
			this.new_attribution(attribution.text));
	},
	
	compose_forecast: function(day, forecast, attribution) {
		this.clear_tray();
		this.div.insert(
			this.new_forecast_element(day, forecast.code, forecast.high, forecast.low));
		this.div.insert(
			this.new_attribution(attribution.text));
	},
	
	new_forecast_element: function(day, code, high, low) {
		var template = day == 'today' ?
			$.string('temperature_forecast_today') :
			$.string('temperature_forecast_tomorrow');
		
		var forecast = template.interpolate({
			high: this.format_temperature(high),
			low: this.format_temperature(low)
		});
		
		return new Element('div', { 'class': 'forecast' })
			.insert(new Element('div', { 'class': 'temperature' }).update(forecast))
			.insert(new Element('div', { 'class': 'condition' }).update(Yahoo.Weather.condition_text(code)));
	},
	
	new_weather_element: function(code, temp) {
		return new Element('div', { 'class': 'currently' })
			.insert(new Element('div', { 'class': 'temperature' }).update(this.format_temperature(temp)))
			.insert(new Element('div', { 'class': 'condition' }).update(Yahoo.Weather.condition_text(code)));
	},
	
	new_attribution: function(text) {
		return new Element('div', { 'class': 'attribution' })
			.update(text);
	},
	
	format_temperature: function(t) {
		if (this.format == 'f') {
			return $.string('temperature_farenheit')
				.interpolate(this.celcius_to_farenheit({ temp: t }));
		}
		else {
			return $.string('temperature_celcius').interpolate({ temp: t });
		}
	},
	
	celcius_to_farenheit: function(c) {
		return Math.round(5 / 9 * (c - 32));
	}
	
});