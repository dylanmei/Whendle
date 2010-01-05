
describe 'Gallery'
	clock_repository = new Object

	timekeeper = new (Class.create(Whendle.Observable, {
		initialize: function($super) { $super(); },
		time: Time.now(),
		format: '',
		offset_time: function(s, f) { f(this.time); }
	}))();

	startup = new Whendle.Observable
	view = new Whendle.Observable
	presenter = new Whendle.Gallery.Presenter(view,
		startup,
		timekeeper,
		new Object,
		clock_repository
	)
	
	new_clock_record = function(id) { return {'id': id, 'name': '', 'timezone': '', 'place': '', 'latitude': 0, 'longitude': 0 } }
	
	describe 'handling a system change'
		before
			a = null
			b = null
			e = null
			clock_repository.get_clocks = function(on_result) {
				on_result([ new_clock_record(1), new_clock_record(2) ])
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
			clock_repository.get_clocks = function(on_result) {
				on_result([ new_clock_record(1), new_clock_record(2) ])
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
