
describe('Gallery (Load)', function() {
	timezones = new Object();
	database = new Object();
	view = new (Class.create(Whendle.Gallery.View, {
		initialize: function($super) { $super(); },
		loaded: function(a, b) { clocks = a; error = b; }
	}))();
	
	before(function() {
		clocks = undefined;
		error = undefined;
		presenter = new Whendle.Gallery.Presenter(view, timezones, database);
	});
	
	describe('When loading an empty view', function() {
		
		before(function() {
			stub(database, 'rowset').and_return(function(s, f, on_result) {
				on_result([]);
			});
			
			view.fire(Whendle.Events.loading, {});
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
			
			view.fire(Whendle.Events.loading, {});
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

			view.fire(Whendle.Events.loading, {});
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
	timezones = new Object();
	database = new Object();
	view = new (Class.create(Whendle.Finder.View, {
		initialize: function($super) { $super(); },
		added: function(a, b) { clock = a; error = b; }
	}))();

	before(function() {
		error = undefined;
		clock = undefined;
		presenter = new Whendle.Gallery.Presenter(view, timezones, database);
	});
	
	describe('When adding a clock', function() {
		before(function() {
			stub(timezones, 'lookup').and_return(function(x, y, on_success) {
				on_success({ 'offset': 1, 'name': 'Yes' });
			});
			stub(database, 'insert').and_return(function(s, p, on_result) {
				on_result(987);
			});
			
			view.fire(Whendle.Events.adding,
				{ 'location': new Whendle.Location('A', 'B', 'C', 1, 23) });
		});
		
		it('should provide a clock with an id', function() {
			expect(clock).not_to(be_undefined);
			expect(clock.id).to(equal, 987);
		});
		
		it('should provide a clock with the location information', function() {
			expect(clock.location).to(equal, 'A');
			expect(clock.area).to(equal, 'B, C');
			expect(clock.latitude).to(equal, 1);
			expect(clock.longitude).to(equal, 23);
		});
		
		it('should provide a clock with timezone information', function() {
			expect(clock.offset).to(equal, 1);
			expect(clock.timezone).to(equal, 'Yes');
		});
		
		it('should not provide an error', function() {
			expect(error).to(be_undefined);
		});	
	});

	describe('When adding a clock causes a timezone service error', function() {
		before(function() {
			stub(timezones, 'lookup').and_return(function(x, y, s, on_error) {
				on_error({ message: 'oh pooh' });
			});

			view.fire(Whendle.Events.adding, { 'location': new Whendle.Location() });
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
			stub(timezones, 'lookup').and_return(function(x, y, on_success) {
				on_success({ 'offset': 1, 'name': 'Yes' });
			});
			
			stub(database, 'insert').and_return(function(s, p, r, on_error) {
				on_error({ code: 0, message: 'oh pooh' })
			});

			view.fire(Whendle.Events.adding, { 'location': new Whendle.Location() });
		});

		it('should not provide a clock', function() {
			expect(clock).to(be_null);
		});

		it('should provide an error', function() {
			expect(error).to(have_property, 'message', 'oh pooh');
		});
	});
});

describe('Gallery (Remove)', function() {
	timezones = new Object();
	database = new Object();
	view = new (Class.create(Whendle.Finder.View, {
		initialize: function($super) { $super(); },
		removed: function(a, b) { id = a; error = b; }
	}))();

	before(function() {
		deleted = false;
		error = undefined;
		id = 0;
		presenter = new Whendle.Gallery.Presenter(view, timezones, database);
	});

	describe('When removing a clock', function() {
		before(function() {
			stub(database, 'remove').and_return(function(s, p, on_result) {
				on_result(deleted = true);
			});
			
			view.fire(Whendle.Events.removing, {
				'clock': new Whendle.Clock(987, 'XYZ', 456, new Whendle.Location('A', 'B', 'C', 1, 23))
			});
		});
		
		it('should return the old id', function() {
			expect(id).to(equal, 987);
		});

		it('should delete the clock from the database', function() {
			expect(deleted).to(be_true);
		});
		
		it('should not provide an error', function() {
			expect(error).to(be_undefined);
		});	
	});
	
	describe('When removing a clock causes a database error', function() {
		before(function() {
			stub(database, 'remove').and_return(function(s, p, r, on_error) {
				on_error({ code: 0, message: 'oh pooh' })
			});

			view.fire(Whendle.Events.removing, { 'clock': new Whendle.Clock(987) });
		});

		it('should not return a clock', function() {
			expect(id).to(equal, 0);
		});

		it('should provide an error', function() {
			expect(error).to(have_property, 'message', 'oh pooh');
		});
	});	
});
