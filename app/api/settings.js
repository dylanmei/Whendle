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

Whendle.SettingsService = Class.create({
	initialize: function(cookie) {
		this._cookie = cookie || new Mojo.Model.Cookie('whendle-settings');
		this._data = this._cookie.get() || {};
	},
	
	is_empty: function() {
		return this.version() === undefined;
	},
	
	flush: function() {
		this._cookie.put({
			version: this.version()
		});
	},

	version: function(v) {
		if (arguments.length) {
			this._data.version = v;
		}
		return this._data.version;
	}
});
