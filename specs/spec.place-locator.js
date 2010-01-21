

describe 'Place Locator'
	ajax = new Object
	loader = new Object
	service = new Whendle.Place_Locator(ajax)
			
	describe 'lookups with less than the minimum characters'
		before
			a = false
			b = false
			e = null
			ajax.load = function(url, on_success, on_error) {
				a = true
			}
			service.lookup('abc', 0, 0, function() { b = true });
		end
		
		it 'should not make a service request'
			a.should.be_false
		end
		
		it 'should not find anything for the caller'
			b.should.be_false
		end
		
		it 'should not return an error'
			e.should.be_null
		end
	end
	
	describe 'lookups that cause an error'
		before
			a = false
			e = false
			ajax.load = function(r, on_success, on_error) {
				on_error({});
			}
			service.lookup('abcdefg', 0, 0, -{ a = true }, function(error) { e = error });
		end		
 
		it 'should not provide a set of locations'
			a.should.be_false
		end
 
		it 'should return an error'
			e.should_not.be_null
		end		
	end	
end
