
describe 'Spotlight'
	place_repository = new Object
	sunlight_calculator = undefined
	profile = { get: -{} }

	timekeeper = new (Class.create(Whendle.Observable, {
		initialize: function($super) { $super(); },
		time: Time.now(),
		utc: Time.now(),
		format: ''
	}))();

	view = new Whendle.Spotlight.View
	presenter = new Whendle.Spotlight.Presenter(view,
		timekeeper,
		place_repository,
		sunlight_calculator,
		profile
	)

	new_place_record = function(id) {
		return { 'id': id, 'name': 'a', 'admin': 'b', 'country': 'c', 'latitude': 0, 'longitude': 0 }
	}

	describe 'handling a system change'
		before
			a = null
			b = null
			e = null
			place_repository.get_place = function(id, on_result) {
				on_result(new_place_record(1))
			}
			view.changed = function(event) { a = event.clock; b = event.reason; e = event.error; }
			view.fire(Whendle.Spotlight.Events.loading, { id: 1 })
			timekeeper.fire(Whendle.Timekeeper.Events.system, 'test reason')
		end

		it 'loads the clocks'
			a.should.have_property 'id', 1
			a.should.have_property 'title',  'a'
			a.should.have_property 'subtitle', 'b, c'
			a.should.have_property 'display'
			a.should.have_property 'day'
		end

		it 'provides the reason'
			b.should.be 'test reason'
		end

		it 'should not return an error'
			e.should.be_undefined
		end
	end

	describe 'handling a timer change'
		before
			a = null
			b = null
			e = null
			place_repository.get_clock = function(id, on_result) {
				on_result(new_place_record(1))
			}
			view.clock_changed = function(event) { a = event.clock; b = event.reason; e = event.error; }
			view.fire(Whendle.Spotlight.Events.loading, { id: 1 })
			timekeeper.fire(Whendle.Timekeeper.Events.timer, {})
		end

		it 'loads the clocks'
			a.should.have_property 'id', 1
			a.should.have_property 'title',  'a'
			a.should.have_property 'subtitle', 'b, c'
			a.should.have_property 'display'
			a.should.have_property 'day'
		end

		it 'provides the reason'
			b.should.be 'time'
		end

		it 'should not return an error'
			e.should.be_undefined
		end
	end
end
