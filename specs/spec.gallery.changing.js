
describe 'Gallery'
	database = new Object
	timezones = new Object
	timezones.load = function(tz, on_complete) { on_complete(new Whendle.Timezone()); }

	timekeeper = new Whendle.Observable
	timekeeper.time_format = function() { return ''; }
	timekeeper.localtime = function() { return Date.to_object(Date.current()); }

	view = new Whendle.Observable
	presenter = new Whendle.Gallery.Presenter(view, timekeeper, timezones, database)
	
	new_clock_record = function(id) { return {'id': id, 'name': '', 'timezone': '', 'place': '', 'latitude': 0, 'longitude': 0 } }
	
	describe 'handling a system change'
		before
			a = null
			b = null
			e = null
			database.rowset = function(s, f, on_result) {
				on_result([ new_clock_record(1), new_clock_record(2) ])
			}
			view.changed = function(event) { a = event.clocks; b = event.reason; e = event.error; }
			timekeeper.fire(Whendle.Events.system, 'test reason')
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
			database.rowset = function(s, f, on_result) {
				on_result([ new_clock_record(1), new_clock_record(2) ])
			}
			view.changed = function(event) { a = event.clocks; b = event.reason; e = event.error; }
			timekeeper.fire(Whendle.Events.timer, {})
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
