
describe 'Startup Service'

	timekeeper = new Object
	schema = new Object
	schema.max_version = -{return 'xyz'}
	service = new Whendle.StartupService(schema, timekeeper);

	describe 'while setting up services'
		before
			a = null
			b = null
			schema.read = -{a = true}
			schema.migrator = -{return null}
			timekeeper.setup = -{b = true}
			service.run();
		end
	
		it 'should init the timekeeper'
			a.should.be_true
		end
		
		it 'should connect to the schema'
			b.should.be_true
		end
	end

	describe 'with an empty schema'
		before
			a = null
			b = null
			c = null
			timekeeper.setup = function(on_complete) {on_complete()}
			schema.read = function(on_complete) {on_complete()}
			schema.migrator = -{a = true}
			service.observe(Whendle.Event.status, function(event) {
				if (b == null) b = event.ready;
				else c = event.ready;
			});

			schema.version = -{return null}
			service.run();
		end
		
		it 'should fire a not-ready status'
			b.should.be_false
		end
		
		it 'should run a schema operation'
			a.should.be_true
		end
		
		it 'should complete with a ready status'
			c.should.be_true
		end
	end

	describe 'with an out of date schema'
		before
			a = null
			b = null
			c = null
			timekeeper.setup = function(on_complete) {on_complete()}
			schema.read = function(on_complete) {on_complete()}
			schema.migrator = -{a = true}
			service.observe(Whendle.Event.status, function(event) {
				if (b == null) b = event.ready;
				else c = event.ready;
			});
			
			schema.version = -{return 'abc'}
			service.run();
		end
		
		it 'should fire a not-ready status'
			b.should.be_false
		end
		
		it 'should run a schema operation'
			a.should.be_true
		end
		
		it 'should complete with a ready status'
			c.should.be_true
		end
	end
	
	describe 'with an up-to-date schema'
		before
			a = null
			b = null
			timekeeper.setup = function(on_complete) {on_complete()}
			schema.read = function(on_complete) {on_complete()}
			schema.migrator = -{a = true}
			service.observe(Whendle.Event.status, function(event) {
				if (b == null) b = event.ready;
			});

			schema.version = -{return 'xyz'}
			service.run();
		end
	
		it 'should fire a ready status'
			b.should.be_true
		end
		
		it 'should not run a schema operation'
			a.should.be_null
		end
	end
end
