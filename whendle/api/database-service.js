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

Whendle.DatabaseStatement = Class.create({
	initialize: function(statement, parameters) {
		this._statement = statement;
		this._parameters = parameters;
	},
	
	statement: function(value) {
		if (!arguments.length) {
			return this._statement || '';
		}
		else {
			this._statement = value;
			return this;
		}
	},
	
	parameters: function(array) {
		if (!arguments.length) {
			return this._parameters || [];
		}
		else {
			this._parameters = array;
			return this;
		}
	},
	
	complete: function(callback) {
		if (!arguments.length) {
			return this._on_success || Prototype.emptyFunction;
		}
		else {
			this._on_success = callback;
			return this;
		}
	},
	
	exception: function(callback) {
		if (!arguments.length) {
			return this._on_error || Prototype.emptyFunction;
		}
		else {
			this._on_error = callback;
			return this;
		}
	}
});

Whendle.DatabaseService = Class.create({
	initialize: function(database) {
		this._datasource = database || openDatabase('Whendle', 1, 'Whendle Database', 65536);
	},
	
	insert: function(statement, parameters, on_insert, on_error) {
		on_insert = this._on_scalar.bind(this, on_insert || Prototype.emptyFunction);
		on_error = this._on_error.bind(this, on_error || Prototype.emptyFunction);
		this._datasource.transaction(function(trx) {
			trx.executeSql(statement, parameters || [], Prototype.emptyFunction, on_error);
			trx.executeSql('select last_insert_rowid()', [], on_insert, on_error);
		});
	},
	
	remove: function(statement, parameters, on_complete, on_error) {
		this.scalar(statement, parameters, on_complete, on_error);
	},
	
	scalar: function(statement, parameters, on_result, on_error) {
		on_result = this._on_scalar.bind(this, on_result || Prototype.emptyFunction);
		on_error = this._on_error.bind(this, on_error || Prototype.emptyFunction);
		this._datasource.transaction(function(trx) {
			trx.executeSql(statement, parameters || [], on_result, on_error);
		});
	},
	
	execute: function(statements) {
		if (!Object.isArray(statements)) {
			statements = [statements];
		}
		
		this._datasource.transaction(function(trx) {
			for (var i = 0; i < statements.length; i++) {
				trx.executeSql(
					statements[i].statement(),
					statements[i].parameters(),
					statements[i].complete(),
					statements[i].exception()
				);
			}
		});
	},
	
	rowset: function(statement, parameters, on_results, on_error) {
		on_results = this._on_rowset.bind(this, on_results || Prototype.emptyFunction);
		on_error = this._on_error.bind(this, on_error || Prototype.emptyFunction);
		this._datasource.transaction(function(trx) {
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