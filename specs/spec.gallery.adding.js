
describe 'Gallery'

	place_repository = new Object
	timezone_locator = new Object
	sunlight_calculator = undefined
	profile = { get: -{} }

	timekeeper = new (Class.create(Whendle.Observable, {
		initialize: function($super) { $super(); },
		time: Time.now(),
		utc: Time.now(),
		format: ''
	}))();

	view = new Whendle.Observable
	presenter = new Whendle.Gallery.Presenter(view,
		timekeeper,
		timezone_locator,
		place_repository,
		sunlight_calculator,
		profile
	)

	mock_tzlookup_result = function(name) {
		return { 'name': name, offset: function() { return 0; } }
	}

	mock_place = function(name, admin, country) {
		return { name: name || '', admin: admin || '', country: country || '' };
	}

	describe 'adding a clock'
		before
			a = null
			e = null
			timezone_locator.lookup = function(x, y, on_success) { on_success(mock_tzlookup_result('A/Z')); }
			place_repository.add_place = function(p, on_result) { on_result(123); }
			view.added = function(event, error) { a = event.clocks; e = event.error; }
			view.fire(Whendle.Gallery.Events.adding,
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
			view.fire(Whendle.Gallery.Events.adding, { 'place': mock_place() })
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
			place_repository.add_place = function(p, on_result, on_error) { on_error({}); }
			view.added = function(event, error) { a = event.clocks; e = event.error; }
			view.fire(Whendle.Gallery.Events.adding, { 'place': mock_place() })
		end

		it 'should not provide a clock'
			a.should.be_empty
		end

		it 'should provide an error'
			e.should_not.be_undefined
		end
	end
end
