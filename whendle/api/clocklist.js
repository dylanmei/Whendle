
Whendle.Clocklist = {
};

Whendle.Clocklist.View = Class.create(Class.Observable, {
	initialize: function($super, element) {
		$super(element);
	},
	
	load: function(clocks, error) {
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
		view.load(results);
	},
	
	_on_load_error: function(view, error) {
		view.load(null, error);
	}
});