
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
	
	describe 'loading an empty set of clocks into a view'
		before
			a = null
			e = null
			place_repository.get_places = function(on_result) {
				on_result([]);
			}
			view.loaded = function(event) { a = event.clocks; e = event.error; }
			view.fire(Whendle.Event.loading)
		end

		it 'should not provide any clocks'
			a.should.be_empty 
		end

		it 'should not return an error'
			e.should.be_undefined;
		end
	end

	describe 'loading a set of clocks into a view'
		before
			a = null
			e = null
			place_repository.get_places = function(on_result) {
				on_result([ new_place_record(1), new_place_record(2) ])
			}
			view.loaded = function(event) { a = event.clocks; e = event.error; }
			view.fire(Whendle.Event.loading)
		end
		
		it 'should provide clocks'
			a.should.have_length 2
		end
		
		it 'should not return an error'
			e.should.be_undefined
		end
	end

	describe 'loading a set of clocks causes a repository error'
		before
			a = null
			e = null
			place_repository.get_places = function(on_result, on_error) {
				on_error({})
			}
			view.loaded = function(event) { a = event.clocks; e = event.error; }
			view.fire(Whendle.Event.loading)
		end
		
		it 'should not provide any clocks'
			a.should.be_empty
		end
		
		it 'should return an error'
			e.should_not.be_undefined
		end		
	end
end
