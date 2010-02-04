
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

	describe 'loading a clock'
		before
			a = null
			e = null
			place_repository.get_place = function(id, on_result) {
				on_result(new_place_record(1))
			}
			view.loaded = function(event) { a = event.clock; e = event.error; }
			view.fire(Whendle.Event.loading, { id: 1 })
		end
		
		it 'loads the clock'
			a.should.have_property 'id', 1
			a.should.have_property 'title',  'a'
			a.should.have_property 'subtitle', 'b, c'
			a.should.have_property 'display'
			a.should.have_property 'day'
		end

		it 'should not return an error'
			e.should.be_undefined
		end
	end
end
