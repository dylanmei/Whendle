
describe 'Gallery'
	database = new Object
	timezones = new Object
	timekeeper = new Whendle.Observable
	view = new Whendle.View
	presenter = new Whendle.Gallery.Presenter(view, timekeeper, timezones, database)
	
	describe 'removing a clock'
		before
			a = null
			b = null
			e = null
			database.remove = function(s, p, on_result) {
				on_result(b = true)
			}
			view.clock_removed = function(event, error) { a = event; e = error; }
			view.fire(Whendle.Events.removing, {
				'clock': new Whendle.Clock(987, 'XYZ', 456, new Whendle.Location('A', 'B', 'C', 1, 23))
			});
		end
		
		it 'should return the id of the clock'
			a.should.have_property 'id'
			a.id.should.be 987
		end
		
		it 'should delete the clock from the database'
			b.should.be_true
		end
		
		it 'should not return an error'
			e.should.be_null
		end
	end
	
	describe 'removing a clock causes a database error'
		before
			a = null
			e = null
			database.remove = function(s, p, on_result, on_error) {
				on_error({})
			}
			view.clock_removed = function(event, error) { a = event; e = error; }
			view.fire(Whendle.Events.removing, {
				'clock': new Whendle.Clock(987, 'XYZ', 456, new Whendle.Location('A', 'B', 'C', 1, 23))
			});
		end		
	
		it 'should not return a result'
			a.should_not.have_property 'id'
		end
		
		it 'should return an error'
			e.should_not.be_null
		end
	end
end


