
describe 'Database Service'
	database = new Object();
	service = new Whendle.DatabaseService(database);
	mock_transaction = function(results, error) {
		return function(callback) {
			callback({
				executeSql: function(s, p, on_result, on_error) {
					if (error) {
						on_error(null, error);
					}
					else {
						on_result(null, mock_results(results));
					}
				}
			});
		}
	}
	mock_results = function(array) {
		return { rows: { length: array.length, item: function(i) { return array[i]; } } };
	}

	describe 'selecting a scalar'
		before
			a = null
			e = null
			database.transaction = mock_transaction([{ v: 'result' }]);
			service.scalar('', [], function(v) { a = v; }, function(error) { e = error; })
		end
		
		it 'should return the value'
			a.should.be 'result'
		end
		
		it 'should not return an error'
			e.should.be_null
		end
	end
	
	describe 'selecting a rowset'
		before
			a = null;
			e = null;
			database.transaction = mock_transaction([{ v: 1 }, { v: 2 }]);
			service.rowset('', [], function(v) { a = v; }, function(error) { e = error; })			
		end
		
		it 'should return the records'
			a.should.have_property 'length', 2
			a.should.include { v: 1 }
			a.should.include { v: 2 }
		end
		
		it 'should not return an error'
			e.should.be_null
		end
	end
	
	describe 'recieving a database error'
		before
			a = null
			e = null
			database.transaction = mock_transaction(null, {});
			service.scalar('', [], function(v) { a = v }, function(error) { e = error; });
		end
		
		it 'should not return a value'
			expect(a).to(be_null);
		end
		
		it 'should return an error'
			e.should_not.be_null
		end
	end
end
