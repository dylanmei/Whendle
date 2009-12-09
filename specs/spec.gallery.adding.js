
describe 'Gallery'
	
	database = new Object
	timezones = new Object
	
	timekeeper = new Whendle.Observable
	timekeeper.format = function() { return ''; }
	timekeeper.time = function() { return Time.now(); }
	timekeeper.offset = function() { return 0; }
	
	startup = { ready: function() { return true; } }
	view = new Whendle.Observable
	presenter = new Whendle.Gallery.Presenter(view, startup, timekeeper, timezones, database)
	
	mock_tzlookup_result = function(name, offset) {
		return { 'offset': 0, 'name': name }
	}
	
	describe 'adding a clock'
		before
			a = null
			e = null
			timezones.lookup = function(x, y, on_success) { on_success(mock_tzlookup_result('Z')); }
			timezones.load = function(tz, callback) { callback(new Whendle.Timezone()); }
			database.insert = function(s, p, on_result) { on_result(123); }
			view.added = function(event, error) { a = event.clocks; e = event.error; }
			view.fire(Whendle.Event.adding,
				{ 'location': new Whendle.Location('A', 'B', 'C', 1, 23) });
		end

		it 'should provide a clock with an identifier'
			a.should.have_length 1
			a[0].id.should.be 123
		end

		it 'should provide a clock with location information'
			a[0].name.should.be 'A'
			a[0].place.should.be 'B, C'
			a[0].latitude.should.be 1
			a[0].longitude.should.be 23
		end
		
		it 'should provide a clock with timezone information'
			a[0].timezone.should.be 'Z'
		end
		
		it 'should not return an error'
			e.should.be_undefined
		end
	end

	describe 'adding a clock causea a timezone service error'
		before
			a = null
			e = null
			timezones.lookup = function(x, y, on_success, on_error) { on_error({}); }
			view.added = function(event, error) { a = event.clocks; e = event.error; }
			view.fire(Whendle.Event.adding, { 'location': new Whendle.Location() })
		end

		it 'should not provide a clock'
			a.should.be_empty
		end

		it 'should provide an error'
			e.should_not.be_undefined
		end
	end
	
	describe 'adding a clock causea a database error'
		before
			a = null
			e = null
			timezones.lookup = function(x, y, on_success) { on_success(mock_tzlookup_result('Z', 1)); }
			database.insert = function(s, p, on_result, on_error) { on_error({}); }
			view.added = function(event, error) { a = event.clocks; e = event.error; }
			view.fire(Whendle.Event.adding, { 'location': new Whendle.Location() })
		end

		it 'should not provide a clock'
			a.should.be_empty
		end

		it 'should provide an error'
			e.should_not.be_undefined
		end
	end
end

