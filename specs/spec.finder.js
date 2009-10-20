
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

			view.fire(Whendle.Events.searching, { query: '123' });
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
			
			view.fire(Whendle.Events.searching, { query: '1234' });
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
			
			view.fire(Whendle.Events.searching, { start: 987, query: '1234' });
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
			
			view.fire(Whendle.Events.searching, { query: '1234' });
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

