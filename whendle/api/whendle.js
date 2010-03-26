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

Whendle = {
	version: '0.2.1',
	schema_version: '0.2',
	tzpath: 'tzdata/',

	homepage: 'http://whendle.posterous.com',
	email: 'whendle.app@gmail.com',

	show_splash: false,
	reset_schema: false,

	show_weather_default: true,
	show_photos_default: false,

	Status: {
		installing: 'installing',
		updating: 'updating',
		loading: 'loading',
		exception: 'exception'
	},

	services: function(name, instance) {
		if (!Whendle._services)
			Whendle._services = {};
		return instance
			? Whendle._services[name] = instance
			: Whendle._services[name];
	},

	system: function() {
		return Whendle.services('Whendle.system');
	},

	profile: function() {
		return Whendle.services('Whendle.profile');
	},

	startup: function() {
		return Whendle.services('Whendle.startup');
	},

	database: function() {
		return Whendle.services('Whendle.database');
	},

	schema: function() {
		return Whendle.services('Whendle.schema');
	},

	timezone_locator: function() {
		return Whendle.services('Whendle.timezone-locator');
	},

	timekeeper: function() {
		return Whendle.services('Whendle.timekeeper');
	},

	sunlight_calculator: function() {
		return Whendle.services('Whendle.sunlight-calculator');
	},

	place_repository: function() {
		return Whendle.services('Whendle.place-repository');
	},

	place_locator: function() {
		return Whendle.services('Whendle.place-locator');
	}
};

if (typeof(Mojo) != 'undefined') {
	$.trace = Mojo.Log.info;
}

