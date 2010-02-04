
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

		var time_format = profile.get('time_format') || 'default';
		var temp_format = profile.get('temperature_format') || 'c';
		
		this.model = {
			time: time_format,
			temperature: temp_format
		}
	},
	
	attach_events: function() {
		this.controller.listen(this.time.id, Mojo.Event.propertyChange,
			this.time.change_handler = this.on_time_format.bind(this));
		this.controller.listen(this.temperature.id, Mojo.Event.propertyChange,
			this.temperature.change_handler = this.on_temperature_format.bind(this));
	},
	
	setup_widgets: function() {
		this.time = this.controller.get('time');
		this.controller.setupWidget(this.time.id, {
			modelProperty: 'time',
			choices: [
				{ label: $L('prefs_default_time_format'), value: 'default' },
				{ label: $L('prefs_24hr_time_format'), value: 'HH24' },
				{ label: $L('prefs_12hr_time_format'), value: 'HH12' }
			]
		}, this.model);
		
		this.temperature = this.controller.get('temperature');
		this.controller.setupWidget(this.temperature.id, {
			modelProperty: 'temperature',
			choices: [
				{ label: $L('prefs_celsius_format'), value: 'c' },
				{ label: $L('prefs_fahrenheit_format'), value: 'f' }
			]
		}, this.model);
	},
	
	on_time_format: function(event) {
		var profile = Whendle.profile();
		if (event.value == 'default') {
			profile.remove('time_format');
		}
		else {
			profile.set('time_format', event.value);
		}
	},

	on_temperature_format: function(event) {
		var profile = Whendle.profile();
		profile.set('temperature_format', event.value);
	},
	
	cleanup: function(event) {
		this.detach_events();
	},
	
	detach_events: function() {
		this.controller.stopListening(this.time, Mojo.Event.propertyChange, this.time.change_handler);
		this.controller.stopListening(this.temperature, Mojo.Event.propertyChange, this.temperature.change_handler);
	}
});
