
PrefsAssistant = Class.create({

	initialize: function() {
	},

	setup: function() {
		var content = this.controller.get('prefs');
		var version = content.down('.help-app-version');
		version.update('v' + Whendle.version + version.innerHTML);

		this.setup_orientation();
		this.setup_model();
		this.setup_widgets();
		this.attach_events();
	},

	setup_orientation: function() {
		var stage_controller = this.controller.stageController;
		if (stage_controller.getWindowOrientation() != 'up')
			stage_controller.setWindowOrientation('up');
	},

	setup_model: function() {
		var profile = Whendle.profile();
		this.model = {
			  time: profile.get('time_format', 'default')
			, temperature: profile.get('temperature_format', 'c')
			, weather: profile.get('show_weather_slides', true)
			, photos: profile.get('show_photo_slides', true)
		}
	},

	attach_events: function() {
		this.controller.listen(this.time.id, Mojo.Event.propertyChange,
			this.time.change_handler = this.on_time_format.bind(this));
		this.controller.listen(this.temperature.id, Mojo.Event.propertyChange,
			this.temperature.change_handler = this.on_temperature_format.bind(this));
		this.controller.listen(this.weather.id, Mojo.Event.propertyChange,
			this.weather.change_handler = this.on_weather_value.bind(this));
		this.controller.listen(this.photos.id, Mojo.Event.propertyChange,
			this.photos.change_handler = this.on_photos_value.bind(this));
	},

	setup_widgets: function() {
		this.setup_time_option();
		this.setup_temperature_option();
		this.setup_weather_option();
		this.setup_photos_option();
	},

	setup_time_option: function() {
		this.time = this.controller.get('time');
		this.controller.setupWidget(this.time.id, {
			modelProperty: 'time',
			choices: [
				{ label: $L('prefs_default_time_format'), value: 'default' },
				{ label: $L('prefs_24hr_time_format'), value: 'HH24' },
				{ label: $L('prefs_12hr_time_format'), value: 'HH12' }
			]
		}, this.model);
	},

	setup_temperature_option: function() {
		this.temperature = this.controller.get('temperature');
		this.controller.setupWidget(this.temperature.id, {
			modelProperty: 'temperature',
			choices: [
				{ label: $L('prefs_celsius_format'), value: 'c' },
				{ label: $L('prefs_fahrenheit_format'), value: 'f' }
			]
		}, this.model);
	},

	setup_weather_option: function() {
		this.weather = this.controller.get('weather');
		this.weather.next('.title')
			.update($.string('prefs_show_local_weather'));
		this.controller.setupWidget(this.weather.id, {
			modelProperty: 'weather'
		}, this.model);
	},

	setup_photos_option: function() {
		this.photos = this.controller.get('photos');
		this.photos.next('.title')
			.update($.string('prefs_show_local_photos'));
		this.controller.setupWidget(this.photos.id, {
			modelProperty: 'photos'
		}, this.model);
	},

	on_time_format: function(event) {
		if (event.value == 'default') {
			Whendle.profile()
				.remove('time_format');
		}
		else {
			Whendle.profile()
				.set('time_format', event.value);
		}
	},

	on_temperature_format: function(event) {
		Whendle.profile()
			.set('temperature_format', event.value);
	},

	on_photos_value: function(event) {
		Whendle.profile()
			.set('show_photos', event.value);
	},

	on_weather_value: function(event) {
		Whendle.profile()
			.set('show_weather', event.value);
	},

	cleanup: function(event) {
		this.detach_events();
	},

	detach_events: function() {
		this.controller.stopListening(this.time,
			Mojo.Event.propertyChange, this.time.change_handler);
		this.controller.stopListening(this.temperature,
			Mojo.Event.propertyChange, this.temperature.change_handler);
		this.controller.stopListening(this.weather,
			Mojo.Event.propertyChange, this.weather.change_handler);
		this.controller.stopListening(this.photos,
			Mojo.Event.propertyChange, this.photos.change_handler);
	}
});
