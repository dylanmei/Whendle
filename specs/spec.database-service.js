
describe('Database Service', function() {
	database = new Object();
	service = new Whendle.DatabaseService(database);
	mock_results = function(array) {
		return { rows: { length: array.length, item: function(i) { return array[i]; } } };
	}
	mock_error = function(message) {
		return { code: 0, message: message };
	}
	
	describe('When returning a scalar', function() {
		before(function() {
			stub(database, 'transaction').and_return(function(f) {
				var trx = {
					executeSql: function(s, p, on_result) {
						on_result(null, mock_results([{ v: 'result' }]));
					}
				};
				f(trx);
			});
		});
		
		it('should call the success function with a value', function() {
			service.scalar('', [],
				function(v) { expect(v).to(equal, 'result'); },
				function(e) { fail('callback unexpected'); }
			);
		});
	});
	
	describe('When returning a rowset', function() {
		before(function() {
			stub(database, 'transaction').and_return(function(f) {
				var trx = {
					executeSql: function(s, p, on_result) {
						on_result(null, mock_results([{ v: 1 }, { v: 2}]));
					}
				};
				f(trx);
			});
		});
		
		it('should call the success function with an array', function() {
			service.rowset('', [],
				function(v) {
					expect(v).to(have_property, 'length', 2);
					expect(v).to(include, { v: 1 });
					expect(v).to(include, { v: 2 });
				}, 
				function(e) { fail('callback unexpected'); }
			);
		});
	});
	
	describe('When fetching a result causes an error ', function() {
		before(function() {
			stub(database, 'transaction').and_return(function(f) {
				var trx = {
					executeSql: function(s, p, r, on_error) {
						on_error(null, mock_error('oh pooh'));
					}
				};
				f(trx);
			});
		});
		
		it('should call the failure function with an error', function() {
			service.rowset('', [],
				function(v) { fail('callback unexpected') },
				function(e) { expect(e).to(have_property, 'message', 'oh pooh'); }
			);
		});	
	});
});