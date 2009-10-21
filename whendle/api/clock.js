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

Whendle.Clock = Class.create({
	initialize: function(id, timezone, offset, location) {
		this.id = id || 0;
		this.timezone = timezone || '';
		this.offset = offset || 0;
		this._location = location || new Whendle.Location();
	}
});


Whendle.Clock.from_location = function(location) {
	return new Whendle.Clock(0, '', 0, location);
}

with (Whendle.Clock.prototype) {
	__defineGetter__('location', function() { return this._location.name; });
	__defineGetter__('area', function() { return this._location.area; });
	__defineGetter__('latitude', function() { return this._location.latitude; });
	__defineGetter__('longitude', function() { return this._location.longitude; });
}