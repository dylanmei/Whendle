
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

	describe 'removing a clock'
		before
			a = null
			b = null
			e = null
			place_repository.delete_place = function(id, on_result) {
				on_result(b = true)
			}
			view.removed = function(event) { a = event.clocks; e = event.error; }
			view.fire(Whendle.Gallery.Events.removing, { 'id': 987 });
		end

		it 'should return the clock'
			a.should.have_length 1
			a[0].id.should.be 987
		end

		it 'should delete the clock from the place_repository'
			b.should.be_true
		end

		it 'should not return an error'
			e.should.be_null
		end
	end

	describe 'removing a clock causes a place_repository error'
		before
			a = null
			e = null
			place_repository.delete_place = function(id, on_result, on_error) {
				on_error({})
			}
			view.removed = function(event) { a = event.clocks; e = event.error; }
			view.fire(Whendle.Gallery.Events.removing, { 'id': 987 });
		end

		it 'should not return a result'
			a.should.be_empty
		end

		it 'should return an error'
			e.should_not.be_undefined
		end
	end
end
