
Weather_Slide = Class.create({

	CELSIUS: 'c',
	FAHRENHEIT: 'f',
	MAX_GENERATIONS: 10,

	initialize: function() {
		this.name = 'weather';
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
			on_ready(this.tray()); return;
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
					this.generations = this.MAX_GENERATIONS;
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
			.update($L('Weather unavailable...')));

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
		var description = this.select_condition_text(condition_code);
		var name = this.select_a_weather_image(description);
		this.pix.src = 'resources/' + name + '.png';
	},

	new_forecast_element: function(day, code, high, low) {
		var template = day == 'today' ?
			$L('Today\'s high #{high}, low #{low}') :
			$L('Tomorrow\'s high #{high}, low #{low}');

		var forecast = template.interpolate({
			high: this.format_temperature(high),
			low: this.format_temperature(low)
		});

		return new Element('div', { 'class': 'forecast' })
			.insert(new Element('div', { 'class': 'temperature' })
				.update(forecast))
			.insert(new Element('div', { 'class': 'condition' })
				.update($L(this.select_condition_text(code))));
	},

	new_weather_element: function(code, temp) {
		return new Element('div', { 'class': 'currently' })
			.insert(new Element('div', { 'class': 'temperature' })
				.update(this.format_temperature(temp)))
			.insert(new Element('div', { 'class': 'condition' })
				.update($L(this.select_condition_text(code))));
	},

	new_attribution: function(text) {
		return new Element('div', { 'class': 'attribution' })
			.update(text);
	},

	format_temperature: function(t) {
		if (this.select_temperature_format() == 'f') {
			return $L('#{temp} &deg;F')
				.interpolate({ temp: this.celsius_to_fahrenheit(t) });
		}
		else {
			return $L('#{temp} &deg;C').interpolate({ temp: t });
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

	select_condition_text: function(condition_code) {
		switch (parseInt(condition_code)) {
			case 0: return 'Tornado';
			case 1: return 'Tropical storm';
			case 2: return 'Hurricane';
			case 3: return 'Severe thunderstorms';
			case 4: return 'Thunderstorms';
			case 5: return 'Mixed rain and snow';
			case 6: return 'Mixed rain and sleet';
			case 7: return 'Mixed snow and sleet';
			case 8: return 'Freezing drizzle';
			case 9: return 'Drizzle';
			case 10: return 'Freezing rain';
			case 11: return 'Showers';
			case 12: return 'Showers';
			case 13: return 'Snow flurries';
			case 14: return 'Light snow showers';
			case 15: return 'Blowing snow';
			case 16: return 'Snow';
			case 17: return 'Hail';
			case 18: return 'Sleet';
			case 19: return 'Dust';
			case 20: return 'Foggy';
			case 21: return 'Haze';
			case 22: return 'Smoky';
			case 23: return 'Blustery';
			case 24: return 'Windy';
			case 25: return 'Cold';
			case 26: return 'Cloudy';
			case 27: return 'Mostly cloudy'; // night
			case 28: return 'Mostly cloudy'; // day
			case 29: return 'Partly cloudy'; // night
			case 30: return 'Partly cloudy'; // day
			case 31: return 'Clear'; // night
			case 32: return 'Sunny';
			case 33: return 'Fair'; // night
			case 34: return 'Fair'; // day
			case 35: return 'Mixed rain and hail';
			case 36: return 'Hot';
			case 37: return 'Isolated thunderstorms';
			case 38: return 'Scattered thunderstorms';
			case 39: return 'Scattered thunderstorms';
			case 40: return 'Scattered showers';
			case 41: return 'Heavy snow';
			case 42: return 'Scattered snow showers';
			case 43: return 'Heavy snow';
			case 44: return 'Partly cloudy';
			case 45: return 'Thundershowers';
			case 46: return 'Snow showers';
			case 47: return 'Isolated thundershowers';
			case 3200:
			default:
				return 'Weather unavailable...';
		}
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