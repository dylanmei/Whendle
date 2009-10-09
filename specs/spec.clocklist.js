
describe('Clocklist', function() {
	database = new Object();
	view = new (Class.create(Whendle.Clocklist.View, {
		initialize: function($super) { $super(); },
		load: function(load_results, load_error) { clocks = load_results; error = load_error; }
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
		
		it('should not load any clocks', function() {
			expect(Object.isArray(clocks)).to(be, true);
			expect(clocks).to(be_empty);
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
	
		it('should load clocks', function() {
			expect(Object.isArray(clocks)).to(be, true);
			expect(clocks).to(have_length, 2);
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
	
		it('should call the load function with an error', function() {
			expect(clocks).to(be_null);
			expect(error).to(have_property, 'message', 'oh pooh');
		});
	});
});