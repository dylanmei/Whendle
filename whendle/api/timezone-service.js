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

Whendle.TimezoneService = Class.create({
	URL_TIMEZONE_BY_LOCATION: 'http://ws.geonames.org/timezoneJSON',

	initialize: function(ajax, tzloader) {
		this._ajax = ajax || new Whendle.AjaxService();
		this._tzloader = tzloader || new Whendle.TzLoader(this._ajax);
	},
	
	lookup: function(latitude, longitude, on_complete, on_error) {
		on_complete = on_complete || Prototype.emptyFunction;
		on_error = on_error || Prototype.emptyFunction;
		
		this._ajax.load(
			this._make_timezone_url(latitude, longitude),
			this._on_timezone_result.bind(this, on_complete),
			this._on_timezone_error.bind(this, on_error)
		);		
	},
	
	_make_timezone_url: function(latitude, longitude) {
		var s = this.URL_TIMEZONE_BY_LOCATION + '?';
		return s + Object.toQueryString({
			'lat': latitude,
			'lng': longitude
		});
	},
	
	_on_timezone_result: function(on_complete, response) {
		on_complete({
			name: response.timezoneId,
			offset: response.rawOffset
		});
	},
	
	_on_timezone_error: function(on_error, error) {
		on_error(error);
	}
});