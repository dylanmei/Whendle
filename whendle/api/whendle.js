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

Whendle = {
	version: '0.1.0',
	schema_version: '0.1',
	stage_name: 'whendle-card-stage',

	show_splash: false,
	reset_schema: false,
	reset_settings: false,
	
	Events: {
		load_ready: ':loadready',
		search: ':search',
		select: ':select'
	},
	
	Strings: function(key, def) {
		return (typeof($L) == 'undefined') ? (def || key) : $L(key);
	},
	
	services: function(name, instance) {
		if (!Whendle._services)
			Whendle._services = {};
		return instance
			? Whendle._services[name] = instance
			: Whendle._services[name];
	},
	
	settings: function() {
		return Whendle.services('Whendle.settings');
	},
	
	database: function() {
		return Whendle.services('Whendle.database');
	},
	
	schema: function() {
		return Whendle.services('Whendle.schema');
	}
};
