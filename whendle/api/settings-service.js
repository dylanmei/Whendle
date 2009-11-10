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

Whendle.SettingsService = Class.create({
	initialize: function(cookie) {
		this._cookie = cookie || new Mojo.Model.Cookie('whendle-settings');
		this._data = this._cookie.get() || {};
		this._temp = {};
	},
	
	is_empty: function() {
		return this.version() === undefined;
	},
	
	destroy: function() {
		this._data = {};
	},
	
	save: function() {
		var version = this.version();
		if (version) {
			this._cookie.put({
				'version': version
			});
		}
	},

	version: function(v) {
		if (arguments.length) {
			this._data.version = v;
		}
		return this._data.version;
	},
	
	time_format: function(v) {
		if (arguemnts.length) {
			this._temp.time_format = v;
		}

		return this._temp.time_format || 'HH24';
	}
});
