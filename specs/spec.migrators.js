
describe 'Migrator (base)'
	database = new Object();
	migrator = new Whendle.Migrator('ABC', database);
	
	it 'should provide its version on completion'
		a = null
		e = null
		migrator.go(function(v) { a = v; }, function(error) { e = error; });
		a.should.be 'ABC'
		e.should.be_null
	end
end

describe 'Migrator (simple)'
	database = new Object
	migrator = new (Class.create(Whendle.Migrator, {
		go: function($super, on_complete, on_error) {
			this.queue_job('', [], on_complete, on_error);
			$super(on_complete, on_error);
		}		
	}))('XYZ', database)

	describe 'after running an update'
		before
			a = null
			e = null
			database.scalar = function(s, p, on_result) {
				on_result(1)
			}
			migrator.go(function(v) { a = v; }, function(error) { e = error; });
		end
		
		it 'should provide the version'
			a.should.be 'XYZ'
		end
		
		it 'should not return an error'
			e.should.be_null
		end
	end
	
	describe 'when running an update causes a database error'
		before
			a = null
			e = null
			database.scalar = function(s, p, on_result, on_error) {
				on_error({})
			}
			migrator.go(function(v) { a = v; }, function(error) { e = error; })
		end
		
		it 'should not provide a version'
			a.should.be_null
		end
		
		it 'should return an error'
			e.should_not.be_null
		end
	end
end