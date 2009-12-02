
describe 'Wait'
	before
		done = false
		wait = new Whendle.Wait(function() { done = true; })
		a = wait.on(-{})
		b = wait.on(-{})
	end

	describe 'when no activities have run'
		before
			wait.ready()
		end
		
		it 'should not be marked complete'
			wait.complete().should.be_false
		end
		
		it 'should not invoke the callback'
			done.should.be_false
		end
	end

	describe 'when all activities have run'
		before
			wait.ready()
			a()
			b()
		end
		
		it 'should be marked complete'
			wait.complete().should.be_true
		end
		
		it 'should invoke the callback'
			done.should.be_true
		end
	end

	describe 'when only some activities have run'
		before
			wait.ready()
			a()
		end
		
		it 'should not be marked complete'
			wait.complete().should.be_false
		end
		
		it 'should not invoke the callback'
			done.should.be_false
		end
	end

	describe 'when the activities are completed before the wait is ready'
		before
			a()
			b()
		end
		
		it 'should be marked complete'
			wait.complete().should.be_true
		end
		
		it 'should not invoke the callback'
			done.should.be_false
		end
	end
	
	describe 'when the wait is ready after the activities are completed'
		before
			a()
			b()
			wait.ready()
		end
		
		it 'should be marked complete'
			wait.complete().should.be_true
		end
		
		it 'should invoke the callback'
			done.should.be_true
		end
	end
	
	describe 'default activities'
		before
			a()
			b()
			c = wait.on(/* no parameters */)
			wait.ready()
		end
		
		it 'should block the wait'
			done.should.be_false
		end
		
		
		it 'should resume the wait when invoked'
			c()
			done.should.be_true
		end
	end
end
