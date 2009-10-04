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

Whendle.DatabaseService = Class.create({
	initialize: function() {
		this._db = openDatabase('Whendle', 1, 'Whendle Database', 65536);
	},

	scalar: function(statement, parameters, on_result, on_error) {
		on_result = this._on_scalar.bind(this, on_result || Prototype.emptyFunction);
		on_error = this._on_error.bind(this, on_error || Prototype.emptyFunction);
		this._db.transaction(function(trx) {
			trx.executeSql(statement, parameters || [], on_result, on_error);
		});
	},
	
	rowset: function(statement, parameters, on_results, on_error) {
		on_results = this._on_rowset.bind(this, on_results || Prototype.emptyFunction);
		on_error = this._on_error.bind(this, on_error || Prototype.emptyFunction);
		this._db.transaction(function(trx) {
			trx.executeSql(statement, parameters || [], on_results, on_error);
		});	
	},
	
	_on_scalar: function(callback, trx, results) {
		var value = null;
		if (results.rows.length > 0) {
			var row = results.rows.item(0);
			var columns = Object.keys(row);
			value = row[columns[0]];
		}
		
		callback(value);
	},
	
	_on_rowset: function(callback, trx, results) {
		var values = [];
		var rowset = results.rows;
		for (var i = 0; i < rowset.length; i++) {
			values.push(rowset.item(i));
		}
		
		callback(values);
	},
	
	_on_error: function(callback, trx, error) {
		callback(error);
	}
});