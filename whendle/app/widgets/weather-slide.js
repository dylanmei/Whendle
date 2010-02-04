
Weather_Slide = Class.create({

	CELSIUS: 'c',
	FAHRENHEIT: 'f',
	
	initialize: function() {
		this.div = new Element('div', { 'class': 'weather-slide-tray' });
		this.pix = this.new_image();
	},
	
	setup: function(clock) {
		this.woeid = clock.woeid;

		// in contrast providing random content, this slide cycles through
		// the current weather, today's forcast, and tomorrow's forecast
		this.cycle = 0;
		this.generations = 0;
	},

	new_image: function() {
		var image = new Image();
		image.getWidth = function() {
			return 320;
		};
		image.getHeight = function() {
			return 400;
		};
		return image;
	},

	tray: function() {
		return this.div;
	},
	
	backdrop: function() {
		return this.pix;
	},

	in_error_state: function() {
		return (this.data || {}).error == 1;
	},
	
	invoke: function(on_ready) {
		if (this.in_error_state()) {
			return on_ready(this.tray());
		}
		
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
		this.data = { error: 1 };
		this.clear_tray();
		this.div.insert(new Element('div', { 'class': 'error' })
			.update($.string('weather_unavailable')));
		
		on_ready(this.tray());
	},
	
	compose_weather: function(weather, attribution) {
		this.clear_tray();
		this.div.insert(
			this.new_weather_element(weather.code, weather.temp));
		this.div.insert(
			this.new_attribution(attribution.text));

		this.compose_backdrop_image(weather.code);
	},
	
	compose_forecast: function(day, forecast, attribution) {
		this.clear_tray();
		this.div.insert(
			this.new_forecast_element(day, forecast.code, forecast.high, forecast.low));
		this.div.insert(
			this.new_attribution(attribution.text));
		
		this.compose_backdrop_image(forecast.code);
	},
	
	compose_backdrop_image: function(condition_code) {
		var description = Yahoo.Weather.condition_text(condition_code);
		var name = this.select_a_weather_image(description);
		this.pix.src = 'resources/' + name + '.png';
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
		if (this.select_temperature_format() == 'f') {
			return $.string('temperature_fahrenheit')
				.interpolate({ temp: this.celsius_to_fahrenheit(t) });
		}
		else {
			return $.string('temperature_celsius').interpolate({ temp: t });
		}
	},
	
	select_temperature_format: function() {
		var profile = Whendle.profile();
		var format = profile.get('temperature_format');

		return format || this.CELSIUS;
	},	
	
	celsius_to_fahrenheit: function(c) {
		return Math.round(((9 / 5) * c) + 32);
	},

	select_a_weather_image: function(description) {
		switch (description.toLowerCase()) {
			case 'cloudy':
			case 'mostly cloudy':
				return 'weather-mostly-cloudy';

			case 'partly cloudy':
			case 'partly cloudy':
				return 'weather-partly-cloudy';

			case 'mixed snow and sleet':
			case 'light snow showers':
			case 'snow flurries':
			case 'blowing snow':
			case 'snow':
			case 'heavy snow':
			case 'scattered snow showers':
			case 'snow showers':
				return 'weather-snow';
			
			case 'cold':
				return 'weather-cold';

			case 'hot':
				return 'weather-hot';

			case 'showers':
			case 'freezing rain':
			case 'scattered showers':
				return 'weather-showers'
				
			case 'mixed rain and snow':
				return 'weather-rain-and-snow';

			case 'freezing drizzle':
			case 'drizzle':
				return 'weather-drizzle';
			
			case 'hail':
			case 'sleet':
			case 'mixed rain and hail':
				return 'weather-hail';

			case 'thunderstorms':
			case 'thundershowers':
			case 'severe thunderstorms':
			case 'isolated thundershowers':
			case 'isolated thunderstorms':
			case 'scattered thunderstorms':
				return 'weather-thunderstorms';
		
			case 'foggy':
			case 'haze':
				return 'weather-foggy';

			case 'blustery':
			case 'windy':
			case 'smoky':
				return 'weather-windy';

			// todo major storms
			case 'tornado':
			case 'tropical storm':
			case 'hurricane':
				return 'weather-windy';

			// todo
			case 'dust':
			case 'clear':
			case 'sunny':
			case 'fair':
				return 'weather-unknown';

			// unknown
			case 'unavailable':
			default:
				return 'weather-unknown';
		}
	}
});