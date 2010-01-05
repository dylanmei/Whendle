
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
			observable.observe('test', function(b) { a = b })
			observable.fire('test', 1)
			a.should.equal 1
		end
	end
	
	describe 'ignoring an event'
		it 'removes the specified handler'
			a = 0
			var f = function() {}
			observable.observe('test', f)
			observable.ignore('test', f)
			observable.fire('test');
			a.should.equal 0
		end
		
		it 'leaves unspecified handlers'
			a = 0
			b = 0
			var f1 = function() { a++; }
			var f2 = function() { b++; }
			observable.observe('test', f1)
			observable.observe('test', f2)
			observable.ignore('test', f1)
			observable.fire('test');
			a.should.equal 0
			b.should.equal 1
		end
		
		it 'removes all handlers'
			a = 0
			b = 0
			var f1 = function() { a++; }
			var f2 = function() { b++; }
			observable.observe('test', f1)
			observable.observe('test', f2)
			observable.ignore('test')
			observable.fire('test');
			a.should.equal 0
			b.should.equal 0
		end
	end
end
