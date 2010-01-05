
describe 'Spotlight'
	repository = new Object
	timezones = new Object
	timezones.load = function(tz, on_complete) { on_complete(new Whendle.Timezone()); }

	timekeeper = new Whendle.Observable
	timekeeper.format = function() { return ''; }
	timekeeper.time = function() { return Time.now(); }
	timekeeper.offset = function() { return 0; }

	startup = new Whendle.Observable;
	view = new Whendle.Spotlight.View
	presenter = new Whendle.Spotlight.Presenter(view, timekeeper, timezones, repository)
	
	new_clock_record = function(id) { return {'id': id, 'name': '', 'timezone': '', 'place': '', 'latitude': 0, 'longitude': 0 } }

	describe 'handling a system change'
		before
			a = null
			b = null
			e = null
			repository.get_clock = function(id, on_result) {
				on_result(new_clock_record(1))
			}
			view.clock_changed = function(event) { a = event.clock; b = event.reason; e = event.error; }
			timekeeper.fire(Whendle.Event.system, 'test reason')
		end
		
		it 'loads the clocks'
			a.should.have_property 'id', 1
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
			repository.get_clock = function(id, on_result) {
				on_result(new_clock_record(1))
			}
			view.clock_changed = function(event) { a = event.clock; b = event.reason; e = event.error; }
			timekeeper.fire(Whendle.Event.timer, {})
		end
		
		it 'loads the clocks'
			a.should.have_property 'id', 1
		end

		it 'provides the reason'
			b.should.be 'time'
		end
		
		it 'should not return an error'
			e.should.be_undefined
		end	
	end
end
