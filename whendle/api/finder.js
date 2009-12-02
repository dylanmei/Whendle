// This file belongs to Whendle, a clock application for the Palm Pre
// http://github.com/dylanmei/Whendle

//
// Copyright (C) 2009 Dylan Meissner (dylanmei@gmail.com)
//
// Permission is hereby granted, free of charge, to any person otaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
// 
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

Whendle.Finder = {
};

Whendle.Finder.View = Class.create(Whendle.View, {
	initialize: function($super) {
		$super();
	},
	
	// 	event = {
	//		locations: [ {Whendle.Location} ],
	//		index: #,
	//		total: #
	//		error: { message:'' }
	//	}
	found: function(event) {
	}
});

Whendle.Finder.Presenter = Class.create({
	URL_SEARCH_BY_NAME: 'http://ws.geonames.org/searchJSON',

	initialize: function(view, ajax, database) {
		this._ajax = ajax || new Whendle.AjaxService();
		this._database = database || Whendle.database();

		view.observe(Whendle.Events.searching,
			this._on_search.bind(this, view));
	},
	
	_on_search: function(view, event) {
		if (!event) return;

		var start = event.start || 0;
		var rows = event.rows || 10;
		var query = (event.query || '').strip();
		
		if (this._is_sensible_query(query)) {
			this._ajax.load(
				this._make_search_url(start, query, rows),
				this._on_search_results.bind(this, view, start),
				this._on_search_error.bind(this, view));
		}
	},
	
	_is_sensible_query: function(query) {
		return (query.length > 3);
	},
	
	_make_search_url: function(index, text, rows) {
		var s = this.URL_SEARCH_BY_NAME + '?';
		return s + Object.toQueryString({
			'startRow': index,
			'name': text + '*',
			'maxRows': rows,
			'featureClass': ['A', 'P']
		});	
	},
	
	_on_search_results: function(view, index, results) {
		var locations = [];
		var total = results.totalResultsCount || 0;

		if (total) {
			var mapper = function(gn) { return this._new_location(gn); }
			locations = results.geonames.collect(mapper.bind(this));
		}
		
		view.found({ 'locations': locations, 'index': index, 'total': total });
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
		view.found({ 'locations': [], 'index': 0, 'total': 0, 'error': error });
	}
});