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

Whendle.Weather_Agent = Class.create({
	initialize: function(woeid) {
		this.woeid = woeid;
	},
	
	get: function(on_complete, on_error) {
		var resource = 'http://weather.yahooapis.com/forecastrss?u=c&w=' + this.woeid;
		
		new Ajax.Request(resource, {
			method: 'get',
			asynchronous: true,
			onSuccess: this.on_response.bind(this, on_complete, on_error),
			onFailure: this.on_error.bind(this, on_error)
		});
	},
	
	on_response: function(on_complete, on_error, response) {
		if (!response.responseXML) on_error();
		else {
			var xml = response.responseXML;
			if (this.rss_is_error(xml)) on_error();
			else {
				on_complete(this.rss_to_object(xml));
			}
		}
	},
	
	rss_is_error: function(xml) {
		var d = xml.documentElement;
		var descriptor = d.querySelector('channel description');

		return descriptor.textContent.indexOf('Error') != -1;
	},
	
	rss_to_object: function(xml) {
		return {
			weather: this.rss_weather_to_object(xml),
			attribution: this.rss_image_to_object(xml)
		};
	},
	
	rss_weather_to_object: function(xml) {
		var d = xml.documentElement;
		
		var condition = d.querySelector('item condition');
		var forecast1 = d.querySelector('item forecast:first-of-type');
		var forecast2 = d.querySelector('item forecast:last-of-type');

		return {
			code: condition.getAttribute('code'),
			temp: condition.getAttribute('temp'),
			today: {
				code: forecast1.getAttribute('code'),
				high: forecast1.getAttribute('high'),
				low: forecast1.getAttribute('low')
			},
			tomorrow: {
				code: forecast2.getAttribute('code'),
				high: forecast2.getAttribute('high'),
				low: forecast2.getAttribute('low')
			}
		};
	},
	
	rss_image_to_object: function(xml) {
		var d = xml.documentElement;
		
		return {
			text: d.querySelector('image title').textContent,
			width: d.querySelector('image width').textContent,
			height: d.querySelector('image height').textContent,
			link: d.querySelector('image link').textContent,
			url: d.querySelector('image url').textContent
		};
	},
	
	on_error: function(error) {
		$.trace('error');
	}
});
