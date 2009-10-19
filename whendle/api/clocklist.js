
Whendle.Clocklist = {
};

Whendle.Clocklist.View = Class.create(Whendle.View, {
	initialize: function($super, element) {
		$super(element);
	},
	
	loaded: function(clocks, error) {
	}
});

Whendle.Clocklist.Presenter = Class.create({
	initialize: function(view, database) {
		this._database = database || Whendle.database();

		view.observe(Whendle.Events.load_ready,
			this._on_load_ready.bind(this, view));
	},
	
	_on_load_ready: function(view) {
		this._database.rowset('select * from clocks', [],
			this._on_load_clocks.bind(this, view),
			this._on_load_error.bind(this, view)
		);
	},
	
	_on_load_clocks: function(view, results) {
		
		if (results) {
			var mapper = function(gn) { return this._new_clock(gn); }
			results = results.collect(mapper.bind(this));
		}
		
		view.loaded(results);
	},
	
	_new_clock: function(data) {
		return new Whendle.Clock(
			this._new_location(data),
			data.timezone,
			data.offset
		);
	},
	
	_new_location: function(data) {
		return new Whendle.Location(
				data.location,
				data.district,
				data.country,
				data.latitude,
				data.longitude
			);
	},
	
	_on_load_error: function(view, error) {
		view.loaded(null, error);
	}
});