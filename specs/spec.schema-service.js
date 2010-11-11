
describe 'Schema Service'
	before
		database = new Whendle.DatabaseService(new Object())
		service = new Whendle.SchemaService(database)
	end

	describe 'reading the schema for the first time'
		before
			a = null
			e = null
			database.scalar = function(s, p, on_result) {
				on_result(false)
			}
			service.read(function(v) { a = v; }, function(error) { e = error; });
		end
		
		it 'should provide the default version'
			a.should.be '0.0'
			service.version().should.be '0.0'
		end
		
		it 'should not return an error'
			e.should.be_null
		end
	end
	
	describe 'reading an existing schema'
		before
			a = null
			e = null
			database.scalar = function(s, p, on_result) {
				if (s.indexOf('select count') == 0) on_result(true)
				if (s.indexOf('select version') == 0) on_result('ABC')
			}
			service.read(function(v) { a = v; }, function(error) { e = error; })
		end
	
		it 'should provide the version'
			a.should.be 'ABC'
			service.version().should.be 'ABC'
		end
		
		it 'should not return an error'
			e.should.be_null
		end
	end

	describe 'reading the schema causes an error'
		before
			a = null
			e = null
			database.scalar = function(s, p, on_result, on_error) {
				on_error({})
			}
			service.read(function(v) { a = v; }, function(error) { e = error; });
		end
		
		it 'should not return a value'
			a.should.be_null
		end
		
		it 'should return the error'
			e.should_not.be_null
		end
	end
	
	describe 'updating the schema'
		before
			a = null
			e = null
			migrator = new Whendle.Migrator('XYZ', database)
			service.update(migrator, function(v) { a = v; }, function(error) { e = error; });
		end
		
		it 'should update the version'
			a.should.be 'XYZ'
			service.version().should.be 'XYZ'
		end
		
		it 'should not return an error'
			e.should.be_null
		end
	end
	
	describe 'updating the schema causes an error'
		before
			a = null
			e = null
			migrator = new Whendle.Migrator('XYZ', database)
			migrator.go = function(on_complete, on_error) { on_error({}); }
			service.update(migrator, function(v) { a = v; }, function(error) { e = error; });
		end
		
		it 'should update the version'
			a.should.be_null
		end
		
		it 'should not return an error'
			e.should_not.be_null
		end	
	end
end
