
describe('Observable', function() {
	before_each(function() {
		observable = new Whendle.Observable();
	});
	
	describe('When observing an event', function() {
		it('adds the handler', function() {
			f = function() {};
			observable.observe('test', f);
			expect(observable.handlers('test')).to(include, f);
		});
	});
	
	describe('When firing an event', function() {
		it('invokes the handler', function() {
			x = 0;
			observable.observe('test', function() { x = 1; });
			observable.fire('test');
			expect(x).to(equal, 1);
		});
		
		it('provides the event data', function() {
			x = 0;
			observable.observe('test', function(y) { x = y });
			observable.fire('test', 2);
			expect(x).to(equal, 2);
		});
		
		it('does not invoke other handlers', function() {
			x = 0;
			y = 0;
			observable.observe('test1', function() { x = x + 1; });
			observable.observe('test2', function() { y = y + 1; });

			observable.fire('test1');
			observable.fire('test2');
			expect(x).to(equal, 1);
			expect(y).to(equal, 1);
		});
	});
});
