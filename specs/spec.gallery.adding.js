
describe 'Gallery'

	place_repository = new Object
	timezone_locator = new Object
	
	timekeeper = new (Class.create(Whendle.Observable, {
		initialize: function($super) { $super(); },
		time: Time.now(),
		format: '',
		offset_time: function(s, f) { f(this.time); }
	}))();
	
	view = new Whendle.Observable
	presenter = new Whendle.Gallery.Presenter(view,
		timekeeper,
		timezone_locator,
		place_repository
	)
	
	mock_tzlookup_result = function(name, offset) {
		return { 'offset': 0, 'name': name }
	}
	
	mock_place = function(name, admin, country) {
		return { name: name || '', admin: admin || '', country: country || '' };
	}

	describe 'adding a clock'
		before
			a = null
			e = null
			timezone_locator.lookup = function(x, y, on_success) { on_success(mock_tzlookup_result('Z')); }
			place_repository.put_place = function(p, on_result) { on_result(123); }
			view.added = function(event, error) { a = event.clocks; e = event.error; }
			view.fire(Whendle.Event.adding,
				{ 'place': mock_place('A', 'B', 'C') });
		end

		it 'should provide a clock with an identifier'
			a.should.have_length 1
			a[0].id.should.be 123
		end

		it 'should provide a clock with title/subtitle'
			a[0].title.should.be 'A'
			a[0].subtitle.should.be 'B, C'
		end
		
		it 'should not return an error'
			e.should.be_undefined
		end	
	end

	describe 'adding a clock causes a timezone service error'
		before
			a = null
			e = null
			timezone_locator.lookup = function(x, y, on_success, on_error) { on_error({}); }
			view.added = function(event, error) { a = event.clocks; e = event.error; }
			view.fire(Whendle.Event.adding, { 'place': mock_place() })
		end

		it 'should not provide a clock'
			a.should.be_empty
		end

		it 'should provide an error'
			e.should_not.be_undefined
		end
	end
	
	describe 'adding a clock causes a database error'
		before
			a = null
			e = null
			timezone_locator.lookup = function(x, y, on_success) { on_success(mock_tzlookup_result('Z', 1)); }
			place_repository.put_place = function(p, on_result, on_error) { on_error({}); }
			view.added = function(event, error) { a = event.clocks; e = event.error; }
			view.fire(Whendle.Event.adding, { 'place': mock_place() })
		end

		it 'should not provide a clock'
			a.should.be_empty
		end

		it 'should provide an error'
			e.should_not.be_undefined
		end
	end
end

