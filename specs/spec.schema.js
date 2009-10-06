
describe('Schema Service', function() {
	database = new Whendle.DatabaseService(new Object());
	service = new Whendle.SchemaService(database);

	describe('When reading the schema', function() {
		before(function() {
			on_success = function(v) { expect(v).to(equal, 'ABC'); }
			on_failure = function(e) { fail('failure callback was unexpected.'); }
		});
		
		before_each(function() {
			// first call is to find out if the version table exists
			stub(database, 'scalar').and_return(function(s, p, on_result) {
				// second call fetches the version
				stub(database, 'scalar').and_return(function(s, p, on_result) {
					on_result('ABC');
				});

				on_result(true);
			});
		});
		
		it('should call the success function with a version', function() {
			service.read(on_success, on_failure);
		});
	});
	
	describe('When reading the schema for the first time', function() {
		before(function() {
			on_success = function(v) { expect(v).to(equal, '0.0'); }
			on_failure = function(e) { fail('failure callback was unexpected.'); }
		});
		
		before_each(function() {
			stub(database, 'scalar').and_return(function(s, p, on_result) {
				on_result(false);
			});
		});
		
		it('should call the success function with the default version', function() {
			service.read(on_success, on_failure);
		});
	});
	
	describe('When reading the schema causes an error ', function() {
		before(function() {
			on_success = function(v) { fail('success callback was unexpected.') }
			on_failure = function(e) { expect(e).to(have_property, 'message', 'oh pooh'); }
		});
		
		before_each(function() {
			stub(database, 'scalar').and_return(function(s, p, r, on_error) {
				on_error({ code: 0, message: 'oh pooh' });
			});
		});
		
		it('should call the failure function with an error', function() {
			service.read(on_success, on_failure);
		});	
	});
});