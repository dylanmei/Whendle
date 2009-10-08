
describe('Migrator (base)', function() {
	database = new Object();
	migrator = new Whendle.Migrator('ABC', database);

	describe('When jobs are complete', function() {
		it('should call the success function with its version', function() {
			migrator.go(
				function(v) { expect(v).to(equal, 'ABC'); },
				function(e) { fail('callback unexpected'); }
			);
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
			stub(database, 'scalar').and_return(function(s, p, on_result) {
				on_result(1);
			});	
		});
		
		it('should call the success function with its version', function() {
			migrator.go(
				function(v) { expect(v).to(equal, 'XYZ'); },
				function(e) { fail('callback unexpected'); }
			);
		});
	});
	
	describe('When running a job causes an error', function() {
		before(function() {
			stub(database, 'scalar').and_return(function(s, p, r, on_error) {
				on_error({ code: 0, message: 'oh pooh' });
			});			
		});
		
		it('should call the failure function with an error', function() {
			migrator.go(
				function(v) { fail('success callback was unexpected.') },
				function(e) { expect(e).to(have_property, 'message', 'oh pooh'); }
			);
		});			
	});
});