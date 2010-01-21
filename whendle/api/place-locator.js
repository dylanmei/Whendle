// This file belongs to Whendle, a clock application for the Palm Pre
// http://github.com/dylanmei/Whendle

//
// Copyright (C) 2009-2010 Dylan Meissner (dylanmei@gmail.com)
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

Whendle.Place_Locator = Class.create({
	GEONAMES_SEARCH_BY_NAME: 'http://ws.geonames.org/searchJSON',

	initialize: function(ajax) {
		this.ajax = ajax || new Whendle.AjaxService();
	},
	
	lookup: function(query, index, size, on_complete, on_error) {
		on_complete = on_complete || Prototype.emptyFunction;
		on_error = on_error || Prototype.emptyFunction;
	
		query = (query || '').strip();	
		if (this.is_sensible_query(query)) {
			this.ajax.load(
				this.geonames_search_url(query, index, size),
				this.on_geonames_results.bind(this, index, on_complete),
				this.on_search_error.bind(this, on_error));
		}
	},
	
	is_sensible_query: function(query) {
		return (query.length > 3);
	},
	
	geonames_search_url: function(text, index, rows) {
		var s = this.GEONAMES_SEARCH_BY_NAME + '?';
		return s + Object.toQueryString({
			'startRow': index,
			'name': text + '*',
			'maxRows': rows,
			'featureClass': ['A', 'P']
		});	
	},
	
	on_geonames_results: function(index, on_complete, results) {
		var locations = [];
		var total = results.totalResultsCount || 0;

		if (total) {
			var mapper = function(gn) { return this.geoname_to_place(gn); }
			locations = results.geonames.collect(mapper.bind(this));
		}
		
		on_complete({ 'places': locations, 'index': index, 'total': total });
	},

	geoname_to_place: function(geoname) {
		return new Whendle.Location(
			geoname.name,
			geoname.adminName1,
			geoname.countryName,
			geoname.lat,
			geoname.lng
		);
	},

	on_search_error: function(on_error, error) {
		on_error({ 'error': error });
	}
});