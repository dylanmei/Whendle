
describe 'Gallery'
	
	database = new Object
	timezones = new Object
	timekeeper = new Whendle.Observable
	view = new Whendle.View
	presenter = new Whendle.Gallery.Presenter(view, timekeeper, timezones, database)
	
	// begin fixme:
	timekeeper.time_format = function() { return ''; }
	// end fixme
	
	mock_tzlookup_result = function(name, offset) {
		return { 'offset': offset, 'name': name }
	}
	
	//returns a Whendle.Timezone
	mock_tzload_result = function(offset) { return { 'offset': function() { return offset; } } }
	
	describe 'adding a clock'
		before
			a = null
			e = null
			timezones.lookup = function(x, y, on_success) { on_success(mock_tzlookup_result('Z', 1)); }
			timezones.load = function(tz, callback) { callback(mock_tzload_result(1)); }
			database.insert = function(s, p, on_result) { on_result(123); }
			view.clock_added = function(event, error) { a = event; e = error; }
			view.fire(Whendle.Events.adding,
				{ 'location': new Whendle.Location('A', 'B', 'C', 1, 23) });
		end

		it 'should provide a clock with an identifier'
			a.should.have_property 'clock'
			a.clock.id.should.be 123
		end
		
		it 'should provide a clock with location information'
			a.clock.location.should.be 'A'
			a.clock.area.should.be 'B, C'
			a.clock.latitude.should.be 1
			a.clock.longitude.should.be 23
		end
		
		it 'should provide a clock with timezone information'
			a.clock.offset.should.be 1
			a.clock.timezone.should.be 'Z'
		end
		
		it 'should not return an error'
			e.should.be_null
		end
	end

	describe 'adding a clock causea a timezone service error'
		before
			a = null
			e = null
			timezones.lookup = function(x, y, on_success, on_error) { on_error({}); }
			view.clock_added = function(event, error) { a = event; e = error; }
			view.fire(Whendle.Events.adding, { 'location': new Whendle.Location() })
		end

		it 'should not provide a clock'
			a.should_not.have_property 'clock'
		end

		it 'should provide an error'
			e.should_not.be_null
		end
	end
	
	describe 'adding a clock causea a database error'
		before
			a = null
			e = null
			timezones.lookup = function(x, y, on_success) { on_success(mock_tzlookup_result('Z', 1)); }
			database.insert = function(s, p, on_result, on_error) { on_error({}); }
			view.clock_added = function(event, error) { a = event; e = error; }
			view.fire(Whendle.Events.adding, { 'location': new Whendle.Location() })
		end

		it 'should not provide a clock'
			a.should_not.have_property 'clock'
		end

		it 'should provide an error'
			e.should_not.be_null
		end
	end
end

