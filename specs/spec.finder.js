
describe 'Finder'
	view = new Whendle.Observable
	locator = new Object;
	presenter = new Whendle.Finder.Presenter(view, locator)
	
	mock_results = function(results, count) {
		return { places: results, index: 0, 'total': count || results.length }
	}
	
	describe 'searches that return with no results'
		before
			a = null
			b = null
			c = null
			e = null
			locator.lookup = function(q, i, s, on_success) {
				on_success(mock_results([]));
			}
			view.found = function(event) { a = event.results; b = event.index; c = event.total; e = event.error; }
			view.fire(Whendle.Event.searching, { query: 'abcxyz' });
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
			locator.lookup = function(q, i, s, on_success) {
				on_success(mock_results([new Whendle.Place, new Whendle.Place, new Whendle.Place]));
			}
			view.found = function(event) { a = event.results; b = event.index; c = event.total; e = event.error; }
			view.fire(Whendle.Event.searching, { query: 'abcxyz' });
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
			locator.lookup = function(q, i, s, on_success, on_error) {
				on_error({});
			}
			view.found = function(event) { a = event.results; b = event.index; c = event.total; e = event.error; }
			view.fire(Whendle.Event.searching, { query: 'abcxyz' });
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
