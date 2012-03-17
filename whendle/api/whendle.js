
Whendle = {
	version: '0.5.3',
	schema_version: '0.2',
	tzpath: 'tzdata/',

	homepage: 'http://whendle.com',
    helppage: 'http://whendle.com/help',
	email: 'whendle.app@gmail.com',

	show_splash: false,
	reset_schema: false,

	show_weather_default: true,
	show_photos_default: false,

	Status: {
		installing: 'installing',
		updating: 'updating',
		loading: 'loading',
		exception: 'exception'
	},

	services: function(name, instance) {
		if (!Whendle._services)
			Whendle._services = {};
		return instance
			? Whendle._services[name] = instance
			: Whendle._services[name];
	},

	system: function() {
		return Whendle.services('Whendle.system');
	},

	profile: function() {
		return Whendle.services('Whendle.profile');
	},

	startup: function() {
		return Whendle.services('Whendle.startup');
	},

	database: function() {
		return Whendle.services('Whendle.database');
	},

	schema: function() {
		return Whendle.services('Whendle.schema');
	},

	timezone_locator: function() {
		return Whendle.services('Whendle.timezone-locator');
	},

	timekeeper: function() {
		return Whendle.services('Whendle.timekeeper');
	},

	sunlight_calculator: function() {
		return Whendle.services('Whendle.sunlight-calculator');
	},

	place_repository: function() {
		return Whendle.services('Whendle.place-repository');
	},

	place_locator: function() {
		return Whendle.services('Whendle.place-locator');
	}
};

if (typeof(Mojo) != 'undefined') {
	$.trace = Mojo.Log.info;
}

