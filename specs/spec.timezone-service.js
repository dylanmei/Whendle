

describe 'Timezone Service'
	ajax = new Object
	loader = new Object
	service = new Whendle.TimezoneService(ajax, loader)
	mock_response = function(offset, timezone) {
		return { 'rawOffset': offset, 'timezoneId': timezone }
	}
	
	describe 'looking up a timezone'
		before
			a = null;
			e = null;
			ajax.load = function(url, on_success) {
				on_success(mock_response(123, 'abc'))
			}
			service.lookup(0, 0, function(v) { a = v; }, function(error) { e = error; });
		end
		
		it 'should provide the timezone'
			a.name.should.be 'abc'
			a.offset.should.be 123 * 60
		end
		
		it 'should not return an error'
			e.should.be_null
		end
	end
	
	describe 'handling an ajax error'
		before
			a = null;
			e = null;
			ajax.load = function(url, on_success, on_error) {
				on_error({})
			}
			service.lookup(0, 0, function(v) { a = v; }, function(error) { e = error; });
		end
		
		it 'should not provide a result'
			a.should.be_null
		end
		
		it 'should return an error'
			e.should_not.be_null
		end
	end
	
	describe 'loading a timezone'
		before
			a = null
			b = 0
			loader.load = function(name, f) { b++; f('Zone a/b') }
			service.load('a/b', -{a = true})
			service.load('a/b', -{})
		end
		
		it 'should load the timezone from disk'
			a.should.be_true
		end
		
		it 'should cache the timezone'
			b.should.be 1
		end
	end
end
