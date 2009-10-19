
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
		view.loaded(results);
	},
	
	_on_load_error: function(view, error) {
		view.loaded(null, error);
	}
});