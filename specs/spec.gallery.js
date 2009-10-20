
describe('Gallery (Load)', function() {
	ajax = new Object();
	database = new Object();
	view = new (Class.create(Whendle.Gallery.View, {
		initialize: function($super) { $super(); },
		loaded: function(a, b) { clocks = a; error = b; }
	}))();
	
	before(function() {
		clocks = undefined;
		error = undefined;
		presenter = new Whendle.Gallery.Presenter(view, ajax, database);
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

describe('Gallery (Add)', function() {
	ajax = new Object();
	database = new Object();
	view = new (Class.create(Whendle.Finder.View, {
		initialize: function($super) { $super(); },
		added: function(a, b) { clock = a; error = b; }
	}))();

	before(function() {
		saved = false;
		error = undefined;
		presenter = new Whendle.Gallery.Presenter(view, ajax, database);
	});
	
	describe('When adding a clock', function() {
		before(function() {
			stub(ajax, 'load').and_return(function(r, on_success) {
				on_success({ 'rawOffset': 1, 'timezoneId': 'Yes' });
			});
			stub(database, 'scalar').and_return(function(s, p, on_result) {
				on_result(saved = true);
			});
			
			view.fire(Whendle.Events.add,
				{ 'location': new Whendle.Location('A', 'B', 'C', 1, 23) });
		});
		
		it('should provide a clock with the location information', function() {
			expect(clock).not_to(be_undefined);
			expect(clock.location).to(equal, 'A');
			expect(clock.area).to(equal, 'B, C');
			expect(clock.latitude).to(equal, 1);
			expect(clock.longitude).to(equal, 23);
		});
		
		it('should provide a clock with timezone information', function() {
			expect(clock.offset).to(equal, 1);
			expect(clock.timezone).to(equal, 'Yes');
		});
		
		it('should save a clock', function() {
			expect(saved).to(be_true);
		});
		
		it('should not provide an error', function() {
			expect(error).to(be_undefined);
		});	
	});
	
	describe('When adding a clock causes an ajax error', function() {
		before(function() {
			stub(ajax, 'load').and_return(function(r, s, on_error) {
				on_error({ message: 'oh pooh' });
			});

			view.fire(Whendle.Events.add, { 'location': new Whendle.Location() });
		});

		it('should not provide a clock', function() {
			expect(clock).to(be_null);
		});

		it('should provide an error', function() {
			expect(error).to(have_property, 'message', 'oh pooh');
		});
	});
	
	describe('When adding a clock causes a database error', function() {
		before(function() {
			stub(ajax, 'load').and_return(function(r, on_success) {
				on_success({ 'rawOffset': 1, 'timezoneId': 'Yes' });
			});
			
			stub(database, 'scalar').and_return(function(s, p, r, on_error) {
				on_error({ code: 0, message: 'oh pooh' })
			});

			view.fire(Whendle.Events.add, { 'location': new Whendle.Location() });
		});

		it('should not provide a clock', function() {
			expect(clock).to(be_null);
		});

		it('should provide an error', function() {
			expect(error).to(have_property, 'message', 'oh pooh');
		});
	});
});