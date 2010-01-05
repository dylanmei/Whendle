

describe 'Timezone Repository'
	loader = new Object
	service = new Whendle.Timezone_Repository(loader)
	
	describe 'loading a timezone'
		before
			a = null
			b = 0
			loader.load = function(name, f) { b++; f('Zone a/b') }
			service.get_timezone('a/b', -{a = true})
			service.get_timezone('a/b', -{})
		end
		
		it 'should load the timezone from disk'
			a.should.be_true
		end
		
		it 'should cache the timezone'
			b.should.be 1
		end
	end
end
