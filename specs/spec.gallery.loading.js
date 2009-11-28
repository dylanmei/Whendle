
describe 'Gallery'
	
	database = new Object
	timezones = new Object
	timekeeper = new Whendle.Observable
	view = new Whendle.View
	presenter = new Whendle.Gallery.Presenter(view, timekeeper, timezones, database)
	
	// begin fixme:
	timekeeper.time_format = function() { return ''; }
	view.clock_updated = Prototype.emptyFunction
	timezones.load = Prototype.emptyFunction
	// end fixme
	
	describe 'loading an empty set of clocks into a view'
		before
			a = null
			e = null
			database.rowset = function(s, f, on_result) {
				on_result([])
			}
			view.clocks_loaded = function(event, error) { a = event; e = error; }
			view.fire(Whendle.Events.loading, {})
		end

		it 'should not provide any clocks'
			a.should.have_property 'clocks'
			a.clocks.should.be_empty
		end

		it 'should not return an error'
			e.should.be_null
		end
	end
	
	describe 'loading a set of clocks into a view'
		before
			a = null
			e = null
			database.rowset = function(s, f, on_result) {
				on_result([ new Object(), new Object() ])
			}
			view.clocks_loaded = function(event, error) { a = event; e = error; }
			view.fire(Whendle.Events.loading, {})
		end
		
		it 'should provide the clocks'
			a.should.have_property 'clocks'
			a.clocks.should.have_length 2
		end
		
		it 'should not return an error'
			e.should.be_null
		end
	end
	
	describe 'loading a set of clocks causes a database error'
		before
			database.rowset = function(s, f, on_result, on_error) {
				on_error({})
			}
			view.clocks_loaded = function(event, error) { a = event; e = error; }
			view.fire(Whendle.Events.loading, {})
			
		end
		
		it 'should not provide any clocks'
			a.should_not.have_property 'clocks'
		end
		
		it 'should return an error'
			e.should_not.be_null
		end		
	end
end
