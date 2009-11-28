
describe 'Observable'
	before_each
		observable = new Whendle.Observable();
	end
	
	describe 'observing an event'
		it 'adds a handler'
			f = function() {}
			observable.observe('test', f);
			observable.handlers('test').should.include f
		end
	end
	
	describe 'firing an event'
		it 'invokes the handler'
			a = 0
			observable.observe('test', function() { a = 1 })
			observable.fire('test')
			a.should.equal 1
		end
		
		it 'passes along the event data'
			a = 0
			observable.observe('test', function(b) { a = b });
			observable.fire('test', 1)
			a.should.equal 1
		end
	end
end
