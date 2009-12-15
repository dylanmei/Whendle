TimezoneService = Class.create(Whendle.TimezoneService, {
	initialize: function($super, tzloader) {
		$super(null, new Whendle.TzLoader(new Whendle.AjaxService(), document.tzpath));
	},
	
	lookup: function(latitude, longitude, on_complete, on_error) {
		var location = document.locations.find(function(l) {
			return l.latitude == latitude && l.longitude == longitude;
		});

		zone = null;
		if (location) zone = document.zones[location.name];
		if (zone) {
			on_complete({ name: zone, offset: 0 });
		}
		else {
			$.trace('missing zone during lookup');
		}
	}
});