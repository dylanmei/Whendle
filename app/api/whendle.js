/*
Copyright (c) 2009, Dylan Meissner <dylanmei@gmail.com>

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
*/

Whendle = {
	version: '0.1.0',
	
	stage_name: 'whendle-card-stage',
	
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
