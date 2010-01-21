

describe 'Timezone Locator'
	ajax = new Object
	service = new Whendle.Timezone_Locator(ajax)
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
end
