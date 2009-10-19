
describe('Finder (Search)', function() {
	ajax = new Object();
	database = new Object();
	view = new (Class.create(Whendle.Finder.View, {
		initialize: function($super) { $super(); },
		loaded: function(a, b, c, d) { places = a; index = b; total = c; error = d; }
	}))();
	
	before(function() {
		index = undefined;
		total = undefined;
		places = undefined;
		error = undefined;
		presenter = new Whendle.Finder.Presenter(view, ajax, database);
	});
	
	describe('When a search has less than 4 characters', function() {
		before(function() {
			stub(ajax, 'load').and_return(function() {
				places = 'oops';
			});

			view.fire(Whendle.Events.search, { query: '123' });
		});
		
		it('should not make a search request', function() {
			expect(places).to(be_undefined);
		});
		
		it('should not provide an err', function() {
			expect(error).to(be_undefined);
		});		
	});
	
	describe('When a search yields no results', function() {
		before(function() {
			stub(ajax, 'load').and_return(function(r, on_success) {
				on_success({ 'totalResultsCount': 0, 'geonames': [] });
			});
			
			view.fire(Whendle.Events.search, { query: '1234' });
		});
	
		it('should not provide any places', function() {
			expect(Object.isArray(places)).to(be, true);
			expect(places).to(be_empty);
		});
		
		it('should provide zero as the index of the results', function() {
			expect(index).to(equal, 0);
		});
		
		it('should provide zero as the total count of results', function() {
			expect(total).to(equal, 0);
		});
		
		it('should not provide an error', function() {
			expect(error).to(be_undefined);
		});		
	});
	
	describe('When a search yields results', function() {
		before(function() {
			stub(ajax, 'load').and_return(function(r, on_success) {
				on_success({ 'totalResultsCount': 1234, 'geonames': [ {}, {}, {} ] });
			});
			
			view.fire(Whendle.Events.search, { start: 987, query: '1234' });
		});
	
		it('should provide places', function() {
			expect(Object.isArray(places)).to(be, true);
			expect(places).to(have_length, 3);
		});
		
		it('should provide the index of the results', function() {
			expect(index).to(equal, 987);
		});
		
		it('should provide the total count of results', function() {
			expect(total).to(equal, 1234);
		});
		
		it('should not provide an error', function() {
			expect(error).to(be_undefined);
		});			
	});
	
	describe('When a search causes an error', function() {
		before(function() {
			stub(ajax, 'load').and_return(function(a, b, on_error) {
				on_error({ message: 'oh pooh' });
			});
			
			view.fire(Whendle.Events.search, { query: '1234' });
		});
	
		it('should not provide any places', function() {
			expect(places).to(be_null);
		});

		it('should provide zero as the index of the results', function() {
			expect(index).to(equal, 0);
		});

		it('should provide zero as the total count of results', function() {
			expect(total).to(equal, 0);
		});
	
		it('should provide an error', function() {
			expect(error).to(have_property, 'message', 'oh pooh');
		});
	});
});

describe('Finder (Select)', function() {
	ajax = new Object();
	database = new Object();
	view = new (Class.create(Whendle.Finder.View, {
		initialize: function($super) { $super(); },
		selected: function(a, b) { clock = a; error = b; }
	}))();

	before(function() {
		saved = false;
		error = undefined;
		presenter = new Whendle.Finder.Presenter(view, ajax, database);
	});
	
	describe('When selecting a location', function() {
		before(function() {
			stub(ajax, 'load').and_return(function(r, on_success) {
				on_success({ 'rawOffset': 1, 'timezoneId': 'Yes' });
			});
			stub(database, 'scalar').and_return(function(s, p, on_result) {
				on_result(saved = true);
			});
			
			view.fire(Whendle.Events.select,
				{ 'location': new Whendle.Location('A', 'B', 'C', 1, 23) });
		});
		
		it('should provide a clock with the location information', function() {
			expect(clock).not_to(be_undefined);
			expect(clock.location.name).to(equal, 'A');
			expect(clock.location.area).to(equal, 'B');
			expect(clock.location.country).to(equal, 'C');
			expect(clock.location.latitude).to(equal, 1);
			expect(clock.location.longitude).to(equal, 23);
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
	
	describe('When selecting a location causes an ajax error', function() {
		before(function() {
			stub(ajax, 'load').and_return(function(r, s, on_error) {
				on_error({ message: 'oh pooh' });
			});

			view.fire(Whendle.Events.select, { 'location': new Whendle.Location() });
		});

		it('should not provide a clock', function() {
			expect(clock).to(be_null);
		});

		it('should provide an error', function() {
			expect(error).to(have_property, 'message', 'oh pooh');
		});
	});
	
	describe('When selecting a location causes a database error', function() {
		before(function() {
			stub(ajax, 'load').and_return(function(r, on_success) {
				on_success({ 'rawOffset': 1, 'timezoneId': 'Yes' });
			});
			
			stub(database, 'scalar').and_return(function(s, p, r, on_error) {
				on_error({ code: 0, message: 'oh pooh' })
			});

			view.fire(Whendle.Events.select, { 'location': new Whendle.Location() });
		});

		it('should not provide a clock', function() {
			expect(clock).to(be_null);
		});

		it('should provide an error', function() {
			expect(error).to(have_property, 'message', 'oh pooh');
		});
	});
});
