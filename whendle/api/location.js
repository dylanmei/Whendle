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

Whendle.Location = Class.create({
	initialize: function(name, area, country, latitude, longitude) {
		this.name = name || '';
		this.area = area || '';
		this.country = country || '';
		this.latitude = latitude || 0;
		this.longitude = longitude || 0;
		this.place = this.format_place();
	},
	
	format_place: function() {
		var has_area = this.area.length > 0;
		var has_country = this.country.length > 0;
		if (has_area && has_country) {
			return Whendle.Strings('location_place_area_country').interpolate(this);
		}
		else if (has_area) {
			return Whendle.Strings('location_place_area').interpolate(this);
		}
		else if (has_country) {
			return Whendle.Strings('location_place_country').interpolate(this);
		}
		
		return '';
	}
});