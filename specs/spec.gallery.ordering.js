
describe 'Gallery'
	place_repository = new Object
	timezone_locator = new Object
	sunlight_calculator = undefined
	profile = { get: -{} }
	timekeeper = new Whendle.Observable

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

	describe 'ordering a clock'
		before
			a = null
			b = null
			e = null
			place_repository.order_places = function(places, on_complete) {
				b = true
				on_complete();
			}
			view.ordered = function(event) { a = event.clocks; e = event.error; }
			view.fire(Whendle.Gallery.Events.ordering, { 'ids': [1, 2] });
		end

		it 'should return the clocks in order'
			a.should.have_length 2
			a[0].should.be 1
			a[1].should.be 2
		end

		it 'should order the clocks in the place_repository'
			b.should.be_true
		end

		it 'should not return an error'
			e.should.be_null
		end
	end

	describe 'ordering clocks causes a place_repository error'
		before
			a = null
			b = null
			e = null
			place_repository.order_places = function(places, on_complete, on_error) {
				on_error('error');
			}
			view.ordered = function(event) { a = event.clocks; e = event.error; }
			view.fire(Whendle.Gallery.Events.ordering, { 'ids': [1, 2] });
		end

		it 'should not return a result'
			a.should.be_empty
		end

		it 'should return an error'
			e.should_not.be_undefined
		end
	end
end
