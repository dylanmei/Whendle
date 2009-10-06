
describe('Migrator (base)', function() {
	database = new Object();
	migrator = new Whendle.Migrator('ABC', database);

	describe('When jobs are complete', function() {
		before(function() {
			on_success = function(v) { expect(v).to(equal, 'ABC'); }
			on_failure = function(e) { fail('failure callback was unexpected.'); }
		});
		
		it('should call the success function with its version', function() {
			migrator.go(on_success, on_failure);
		});
	});
});

describe('Migrator (simple)', function() {
	database = new Object();
	migrator = new (Class.create(Whendle.Migrator, {
		go: function($super, on_complete, on_error) {
			this.queue_job('', [], on_complete, on_error);
			$super(on_complete, on_error);
		}		
	}))('XYZ', database);
	
	describe('When jobs are complete', function() {
		before(function() {
			on_success = function(v) { expect(v).to(equal, 'XYZ'); }
			on_failure = function(e) { fail('failure callback was unexpected.'); }

			stub(database, 'scalar').and_return(function(s, p, on_result) {
				on_result(1);
			});	
		});
		
		it('should call the success function with its version', function() {
			migrator.go(on_success, on_failure);
		});
	});
	
	describe('When running a job causes an error', function() {
		before(function() {
			on_success = function(v) { fail('success callback was unexpected.') }
			on_failure = function(e) { expect(e).to(have_property, 'message', 'oh pooh'); }
			
			stub(database, 'scalar').and_return(function(s, p, r, on_error) {
				on_error({ code: 0, message: 'oh pooh' });
			});			
		});
		
		it('should call the failure function with an error', function() {
			migrator.go(on_success, on_failure);
		});			
	});
});