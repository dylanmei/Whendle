Whendle = {
	version: '0.1.0',
	
	stage_name: 'whendle-card-stage',
	
	services: function(name, instance) {
		if (!Whendle._services)
			Whendle._services = {};
		return instance
			? Whendle._services[name] = instance
			: Whendle._services[name];
	},
	
	settings: function() {
		return Whendle.services('Whendle.settings');
	},
	
	database: function() {
		return Whendle.services('Whendle.database');
	},
	
	schema: function() {
		return Whendle.services('Whendle.schema');
	}
};
