
describe 'Gallery'
	repository = new Object
	view = new Whendle.Observable
	presenter = new Whendle.Gallery.Presenter(view,
		new Whendle.Observable,
		new Whendle.Observable,
		new Object,
		repository
	)
	
	describe 'removing a clock'
		before
			a = null
			b = null
			e = null
			repository.delete_clock = function(id, on_result) {
				on_result(b = true)
			}
			view.removed = function(event) { a = event.clocks; e = event.error; }
			view.fire(Whendle.Event.removing, { 'id': 987 });
		end
		
		it 'should return the clock'
			a.should.have_length 1
			a[0].id.should.be 987
		end
		
		it 'should delete the clock from the repository'
			b.should.be_true
		end
		
		it 'should not return an error'
			e.should.be_null
		end
	end
	
	describe 'removing a clock causes a repository error'
		before
			a = null
			e = null
			repository.delete_clock = function(id, on_result, on_error) {
				on_error({})
			}
			view.removed = function(event) { a = event.clocks; e = event.error; }
			view.fire(Whendle.Event.removing, { 'id': 987 });
		end		
	
		it 'should not return a result'
			a.should.be_empty
		end
		
		it 'should return an error'
			e.should_not.be_undefined
		end
	end
end


