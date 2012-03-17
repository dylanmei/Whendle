
Whendle.Finder = {
	Events: { searching: ':search' }
};

Whendle.Finder.View = Class.create(Whendle.Observable, {
	initialize: function($super) {
		$super();
	},

	// 	event = {
	//		results: [{}],
	//		index: #,
	//		total: #
	//		error: { message:'' }
	//	}
	found: function(event) {
	}
});

Whendle.Finder.Presenter = Class.create({

	initialize: function(view, place_locator) {
		this.place_locator = place_locator || Whendle.place_locator();

		view.observe(Whendle.Finder.Events.searching,
			this.on_search.bind(this, view));
	},

	on_search: function(view, event) {
		if (!event) return;

		var on_results = this.on_search_results.bind(this, view);
		var on_error = this.on_search_error.bind(this, view);
		this.place_locator.lookup(event.query,
			event.start || 0, event.rows || 20, on_results, on_error);
	},

	on_search_results: function(view, results) {
		var places = results.places;
		var index = results.index;
		var total = results.total;

		places = places.collect(function(p) {
			return { 'title': p.name, 'subtitle': Whendle.Place.Format_area(p), place: p };
		});

		view.found({ 'results': places, 'index': index, 'total': total });
	},

	on_search_error: function(view, error) {
		view.found({ 'results': [], 'index': 0, 'total': 0, 'error': error });
	}
});