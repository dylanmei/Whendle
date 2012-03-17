
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

Whendle.DatabaseBatch = Class.create(Enumerable, {
	initialize: function() {
		this._statements = [];
		this._counter = 0;
		this._first_error = null;
	},

	_each: function(iterator) {
		this._statements._each(iterator);
	},

	statement: function(text, parameters) {
		var batch = this;
		this._counter++;
		this._statements.push(
			new Whendle.DatabaseStatement(text, parameters)
				.complete(function() { batch.statement_success(); })
				.exception(function(e) { batch.statement_exception(e); })
		);

		return this;
	},

	complete: function() {
		return this._counter == 0;
	},

	statement_success: function() {
		this._counter--;
		this.try_completion();
	},

	success: function(callback) {
		if (!arguments.length) {
			return this._on_success || Prototype.emptyFunction;
		}
		else {
			this._on_success = callback;
			return this;
		}
	},

	statement_exception: function(error) {
		this._counter--;
		if (!this._first_error) this._first_error = error;
		this.try_completion();
	},

	exception: function(callback) {
		if (!arguments.length) {
			return this._on_error || Prototype.emptyFunction;
		}
		else {
			this._on_error = callback;
			return this;
		}
	},

	try_completion: function() {
		if (!this.complete()) return;

		if (this._first_error) {
			var on_exception = this.exception();
			on_exception(this._first_error);
		}
		else {
			var on_complete = this.success();
			on_complete();
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
			statements = Object.isFunction(statements.toArray)
				? statements.toArray()
				: [statements];
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