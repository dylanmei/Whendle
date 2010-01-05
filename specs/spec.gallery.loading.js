
describe 'Gallery'
	repository = new Object
	timezones = new Object
	timezones.load = function(tz, on_complete) { on_complete(new Whendle.Timezone()); }

	timekeeper = new Whendle.Observable
	timekeeper.format = function() { return ''; }
	timekeeper.time = function() { return Time.now(); }
	timekeeper.offset = function() { return 0; }

	startup = new Whendle.Observable;
	startup.run = -{ this.fire(Whendle.Event.status, { ready: true }); }
	view = new Whendle.Observable
	presenter = new Whendle.Gallery.Presenter(view, startup, timekeeper, timezones, repository)
	
	new_clock_record = function(id) { return {'id': id, 'name': '', 'timezone': '', 'place': '', 'latitude': 0, 'longitude': 0 } }
	
	describe 'loading an empty set of clocks into a view'
		before
			a = null
			e = null
			repository.get_clocks = function(on_result) {
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
			repository.get_clocks = function(on_result) {
				on_result([ new_clock_record(1), new_clock_record(2) ])
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
			repository.get_clocks = function(on_result, on_error) {
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
	
	describe 'loading with a timer'
		before
			a = false
			repository.get_clocks = function(on_result) { on_result([]) }
			timekeeper.start = function() { a = true }
			view.loaded = -{}
			view.fire(Whendle.Event.loading, { 'timer': {} })
		end
		
		it 'should start the timekeeper'
			a.should.be_true
		end
	end
end
