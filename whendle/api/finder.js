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

Whendle.Finder = {
};

Whendle.Finder.View = Class.create(Whendle.Observable, {
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

	initialize: function(view, place_locator) {
		this.place_locator = place_locator || Whendle.place_locator();

		view.observe(Whendle.Event.searching,
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
	
		view.found({ 'locations': places, 'index': index, 'total': total });
	},
	
	on_search_error: function(view, error) {
		view.found({ 'locations': [], 'index': 0, 'total': 0, 'error': error });
	}
});