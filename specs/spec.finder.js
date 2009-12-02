
describe 'Finder'
	ajax = new Object
	datbase = new Object
	view = new Whendle.View
	presenter = new Whendle.Finder.Presenter(view, ajax, database)
	
	mock_results = function(results, count) {
		return { 'totalResultsCount': count || results.length, 'geonames': results }
	}
	
	describe 'searches with less than the minimum characters'
		before
			a = null
			b = null
			c = null
			d = false
			e = null
			ajax.load = function() { d = true; }
			view.found = function(event) { a = event.locations; b = event.index; c = event.total; e = event.error; }
			view.fire(Whendle.Events.searching, { query: 'abc' })
		end
		
		it 'should not make a service request'
			d.should.be_false
		end
		
		it 'should not find anything for the view'
			a.should.be_null
		end
		
		it 'should not return an error'
			e.should.be_null
		end
	end
	
	describe 'searches that return with no results'
		before
			a = null
			b = null
			c = null
			e = null
			ajax.load = function(r, on_success) {
				on_success(mock_results([]));
			}
			view.found = function(event) { a = event.locations; b = event.index; c = event.total; e = event.error; }
			view.fire(Whendle.Events.searching, { query: 'abcxyz' });
		end
		
		it 'should provide an empty set of locations'
			a.should.be_empty
		end
		
		it 'should return 0 for an index'
			b.should.be 0
		end
		
		it 'should return 0 for the total'
			c.should.be 0
		end
		
		it 'should not return an error'
			e.should.be_null
		end
	end
	
	describe 'searches that return with results'
		before
			a = null
			b = null
			c = null
			e = null
			ajax.load = function(r, on_success) {
				on_success(mock_results([{}, {}, {}]));
			}
			view.found = function(event) { a = event.locations; b = event.index; c = event.total; e = event.error; }
			view.fire(Whendle.Events.searching, { query: 'abcxyz' });
		end		
		
		it 'should provide a set of locations'
			a.should.have_length 3
		end
		
		it 'should return an index'
			b.should.be 0
		end
		
		it 'should return the total'
			c.should.be 3
		end
		
		it 'should not return an error'
			e.should.be_null
		end		
	end
	
	describe 'searches that cause an error'
		before
			a = null
			b = null
			c = null
			e = null
			ajax.load = function(r, on_success, on_error) {
				on_error({});
			}
			view.found = function(event) { a = event.locations; b = event.index; c = event.total; e = event.error; }
			view.fire(Whendle.Events.searching, { query: 'abcxyz' });
		end		
		
		it 'should not provide a set of locations'
			a.should.be_empty
		end
		
		it 'should return an index'
			b.should.be 0
		end
		
		it 'should return the total'
			c.should.be 0
		end
		
		it 'should not return an error'
			e.should_not.be_null
		end		
	end	
end
