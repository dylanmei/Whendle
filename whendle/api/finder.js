Whendle.Finder = {
};

Whendle.Finder.View = Class.create(Whendle.View, {
	initialize: function($super) {
		$super();
	},
	
	loaded: function(places, index, total, error) {
	},
	
	selected: function(clock, error) {
	}
});

Whendle.Finder.Presenter = Class.create({
	URL_SEARCH_BY_NAME: 'http://ws.geonames.org/searchJSON',
//	URL_TIMEZONE_BY_LOCATION: 'http://ws.geonames.org/timezoneJSON',

	initialize: function(view, ajax, database) {
		this._ajax = ajax || new Whendle.AjaxService();
		this._database = database || Whendle.database();

		view.observe(Whendle.Events.search,
			this._on_search.bind(this, view));
		view.observe(Whendle.Events.select,
			this._on_select.bind(this, view));
	},
	
	_on_search: function(view, event) {
		if (!event) return;

		var start = event.start || 0;
		var rows = event.rows || 10;
		var query = (event.query || '').strip();
		
		if (this._is_sensible_query(query)) {
			this._ajax.load(
				this._make_request_url(start, query, rows),
				this._on_search_results.bind(this, view, start),
				this._on_search_error.bind(this, view));
		}
	},
	
	_is_sensible_query: function(query) {
		return (query.length > 3);
	},
	
	_make_request_url: function(index, text, rows) {
		var s = this.URL_SEARCH_BY_NAME + '?';
		return s + Object.toQueryString({
			startRow: index,
			name: text + '*',
			maxRows: rows,
			featureClass: ['A', 'P']
		});	
	},
	
	_on_search_results: function(view, index, results) {
		var places = [];
		var total = results.totalResultsCount || 0;

		if (total) {
			var mapper = function(gn) { return this._new_location(gn); }
			places = results.geonames.collect(mapper.bind(this));
		}
		
		view.loaded(places, index, total);
	},
	
	_new_location: function(geoname) {
		return new Whendle.Location(
			geoname.name,
			geoname.adminName1,
			geoname.countryName,
			geoname.lat,
			geoname.lng
		);
	},
	
	_on_search_error: function(view, error) {
		view.loaded(null, 0, 0, error);
	},
	
	_on_select: function(view, event) {
		view.selected(null, null);
	}
});