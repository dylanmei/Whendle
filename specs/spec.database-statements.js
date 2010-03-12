
describe 'Database Statements'

	describe 'executing a batch'
		before
			a = null
			e = null
			b = new Whendle.DatabaseBatch()
				.statement('select * from mojo')
				.statement('select * from mojo')
				.statement('select * from mojo')
				.statement('select * from mojo')
				.success(function() { a = 1; })
				.exception(function() { e = 1; });

			b.each(function(s) {
				var on_complete = s.complete();
				on_complete();
			})
		end

		it 'should execute the success routine'
			a.should.be 1
		end

		it 'should mark the batch completed'
			b.complete().should.be_true
		end

		it 'should not execute the exception'
			e.should.be_null
		end
	end

	describe 'executing a batch with errors'
		before
			a = null
			e = null
			b = new Whendle.DatabaseBatch()
				.statement('select * from mojo')
				.statement('select * from mojo')
				.statement('select * from mojo')
				.statement('select * from mojo')
				.success(function() { a = 1; })
				.exception(function(first_error) { e = first_error; });

			b.each(function(s) {
				var on_error = s.exception();
				on_error('error');
			})
		end

		it 'should not execute the success routine'
			a.should.be_null
		end

		it 'should mark the batch completed'
			b.complete().should.be_true
		end

		it 'should execute the exception'
			e.should.be 'error'
		end
	end
end
