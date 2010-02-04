
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
	
	new_place_record = function(id) {
		return { 'id': id, 'name': '', 'admin': '', 'country': '', 'latitude': 0, 'longitude': 0 }
	}
	
	describe 'handling a system change'
		before
			a = null
			b = null
			e = null
			place_repository.get_places = function(on_result) {
				on_result([ new_place_record(1), new_place_record(2) ])
			}
			view.changed = function(event) { a = event.clocks; b = event.reason; e = event.error; }
			timekeeper.fire(Whendle.Event.system, 'test reason')
		end
		
		it 'loads the clocks'
			a.should.have_length 2
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
			place_repository.get_places = function(on_result) {
				on_result([ new_place_record(1), new_place_record(2) ])
			}
			view.changed = function(event) { a = event.clocks; b = event.reason; e = event.error; }
			timekeeper.fire(Whendle.Event.timer, {})
		end
		
		it 'loads the clocks'
			a.should.have_length 2
		end

		it 'provides the reason'
			b.should.be 'time'
		end
		
		it 'should not return an error'
			e.should.be_undefined
		end	
	end
end
