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