
Whendle.Place_Locator = Class.create({
	SEARCH_BY_NAME: 'http://where.yahooapis.com/v1/places',

	initialize: function(ajax) {
		this.ajax = ajax || new Whendle.AjaxService();
	},
	
	lookup: function(query, index, size, on_complete, on_error) {
		on_complete = on_complete || Prototype.emptyFunction;
		on_error = on_error || Prototype.emptyFunction;
	
		query = (query || '').strip();	
		if (this.is_sensible_query(query)) {
			this.ajax.load(
				this.lookup_search_url(query, index, size),
				this.on_lookup_results.bind(this, index, on_complete),
				this.on_lookup_error.bind(this, on_error));
		}
	},
	
	is_sensible_query: function(query) {
		return (query.length > 3);
	},
	
	lookup_search_url: function(text, index, rows) {
		return this.SEARCH_BY_NAME + '.q(#{text});start=#{start};count=#{count}?format=json&appid=#{app}'
			.interpolate({ text: text, start: index, count: rows, app: Yahoo.APPID });
	},
	
	on_lookup_results: function(index, on_complete, results) {
		
		var data = results.places;
		var start = data.start;
		var total = data.total;

		var places = [];
		if (data.count) {
			places = data.place.collect(this.map_place);
		}
		
		on_complete({ 'places': places, 'index': start, 'total': total });
	},

	map_place: function(p) {
		var place = new Whendle.Place();
		place.name = p.name;
		place.latitude = p.centroid.latitude;
		place.longitude = p.centroid.longitude;
		place.admin = p.admin1;
		place.country = p.country;
		place.woeid = p.woeid;
		place.type = p['placeTypeName attrs'].code;
		
		return place;
	},

	on_lookup_error: function(on_error, error) {
		on_error({ 'error': error });
	}
});

