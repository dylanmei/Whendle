
describe('Clocklist', function() {
	database = new Object();
	view = new (Class.create(Whendle.Clocklist.View, {
		initialize: function($super) { $super(); },
		loaded: function(a, b) { clocks = a; error = b; }
	}))();
	
	before(function() {
		clocks = undefined;
		error = undefined;
		presenter = new Whendle.Clocklist.Presenter(view, database);
	});
	
	describe('When loading an empty view', function() {
		
		before(function() {
			stub(database, 'rowset').and_return(function(s, f, on_result) {
				on_result([]);
			});
			
			view.fire(Whendle.Events.load_ready, {});
		});
		
		it('should not provide any clocks', function() {
			expect(Object.isArray(clocks)).to(be, true);
			expect(clocks).to(be_empty);
		});
		
		it('should not provide an error', function() {
			expect(error).to(be_undefined);
		});
	});
	
	describe('When loading a view', function() {
		before(function() {
			stub(database, 'rowset').and_return(function(s, f, on_result) {
				on_result([ new Object(), new Object() ]);
			});
			
			view.fire(Whendle.Events.load_ready, {});
		});
	
		it('should provide clocks', function() {
			expect(Object.isArray(clocks)).to(be, true);
			expect(clocks).to(have_length, 2);
		});
		
		it('should not provide an error', function() {
			expect(error).to(be_undefined);
		});
	});
	
	describe('When loading a view causes an error', function() {
		before(function() {
			stub(database, 'rowset').and_return(function(s, f, r, on_error) {
				on_error({ code: 0, message: 'oh pooh' });
			});

			view.fire(Whendle.Events.load_ready, {});
		});

		it('should not provide any clocks', function() {
			expect(clocks).to(be_null);
		});
	
		it('should provide an error', function() {
			expect(error).to(have_property, 'message', 'oh pooh');
		});
	});
});