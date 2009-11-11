
describe('Wait', function() {
	before(function() {
		done = false;
		wait = new Whendle.Wait(function() { done = true; });
		h1 = wait.on(function() {});
		h2 = wait.on(function() {});
	});

	describe('When all activities have run', function() {
		before_each(function() {
			wait.ready();
			h1(); h2();
		});

		it('the wait should be complete', function() {
			expect(wait.complete()).to(be_true);
		});

		it('the callback should be invoked', function() {
			expect(done).to(be_true);
		});
	});

	describe('When only some activities have run', function() {
		before(function() {
			wait.ready();
			h1();
		});

		it('the wait should not be complete', function() {
			expect(wait.complete()).to(equal, false);
		});

		it('the callback should not be invoked', function() {
			expect(done).to(be_false);
		});
	});
	
	describe('When the activities are completed before the wait is ready', function() {
		before(function() {
			//wait.ready();
			h1(); h2();
		});

		it('the callback should not be invoked', function() {
			expect(done).to(be_false);
		});
		
	});

	describe('When the wait is ready after the activities are completed', function() {
		before(function() {
			h1(); h2();
			wait.ready();
		});

		it('the callback should be invoked', function() {
			expect(done).to(be_true);
		});
	});
});
