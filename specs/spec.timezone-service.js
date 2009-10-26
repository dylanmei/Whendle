
describe('Timezone Service', function() {
	ajax = new Object();
	
	before(function() {
		error = undefined;
		timezone = undefined;
		service = new Whendle.TimezoneService(ajax);
	});
	
	describe('When looking up a timezone', function() {
		before(function() {
			stub(ajax, 'load').and_return(function(url, on_success) {
				on_success({ 'rawOffset': 123, 'timezoneId': 'Some/Timezone' });
			});

			service.lookup(0, 0,
				function(v) { timezone = v; }, 
				function(e) { error = e; }
			);			
		});

		it('should provide the identifier of the timezone', function() {
			expect(timezone.name).to(equal, 'Some/Timezone');
		});
		
		it('should provide the offset of the timezone', function() {
			expect(timezone.offset).to(equal, 123);
		});
		
		it('should not provide an error', function() {
			expect(error).to(be_undefined);
		});
	});

	describe('When looking up a timezone causes an ajax error', function() {
		before(function() {
			stub(ajax, 'load').and_return(function(r, s, on_error) {
				on_error({ message: 'oh pooh' });
			});

			service.lookup(0, 0,
				function(v) { timezone = v; }, 
				function(e) { error = e; }
			);	
		});

		it('should not provide a result', function() {
			expect(timezone).to(be_undefined);
		});

		it('should provide an error', function() {
			expect(error).to(have_property, 'message', 'oh pooh');
		});
	});
});