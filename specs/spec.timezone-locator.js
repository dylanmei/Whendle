

describe 'Timezone Locator'
	ajax = new Object
	loader = new Object
	service = new Whendle.Timezone_Locator(ajax, loader)
	mock_service_response = function(timezone) {
		return { 'timezoneId': timezone }
	}
	mock_loader_response = function(name) {
		return 'Zone ' + name;
	}
	
	describe 'looking up a timezone'
		before
			a = null
			e = null
			loader.load = function(name, on_success) {
				on_success(mock_loader_response(name));
			}
			ajax.load = function(url, on_success) {
				on_success(mock_service_response('a/bc'))
			}
			service.lookup(0, 0, function(v) { a = v; }, function(error) { e = error; });
		end
		
		it 'should provide the timezone'
			a.name.should.be 'a/bc'
		end
		
		it 'should not return an error'
			e.should.be_null
		end
	end

	describe 'handling a lookup ajax error'
		before
			a = null
			e = null
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
