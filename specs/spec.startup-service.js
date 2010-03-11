
describe 'Startup Service'

	timekeeper = { start: -{} }
	schema = { max_version: -{return 'xyz'} }
	service = new Whendle.StartupService(schema, timekeeper);

	describe 'while setting up services'
		before
			a = null
			b = null
			schema.read = function(f) { a = true; f(); }
			schema.migrator = -{return null}
			schema.version = -{return null}
			timekeeper.setup = function(f) { b = true; f(); }
			service.run();
		end

		it 'should init the timekeeper'
			b.should.be_true
		end

		it 'should connect to the schema'
			a.should.be_true
		end
	end

	describe 'with an empty schema'
		before
			a = null
			b = null
			timekeeper.setup = function(f) { f() }
			schema.read = function(f) { f() }
			service.observe(Whendle.Startup.Events.status, function(event) {
				a = event.ready
				b = event.installing
			});

			schema.version = -{return null}
			service.run();
		end

		it 'should fire a not-ready status'
			a.should.be_false
		end

		it 'should fire an installing status'
			b.should.be_true
		end
	end

	describe 'with an out of date schema'
		before
			a = null
			b = null
			timekeeper.setup = function(f) { f() }
			schema.read = function(f) { f() }
			service.observe(Whendle.Startup.Events.status, function(event) {
				a = event.ready
				b = event.upgrading
			});

			schema.version = -{return 'abc'}
			service.run();
		end

		it 'should fire a not-ready status'
			a.should.be_false
		end

		it 'should fire an upgrading status'
			b.should.be_true
		end
	end

	describe 'with an up-to-date schema'
		before
			a = null
			b = null
			c = null
			timekeeper.setup = function(f) {f () }
			schema.read = function(f) { f() }
			service.observe(Whendle.Startup.Events.status, function(event) {
				a = event.ready;
				b = event.installing || false
				c = event.updating || false
			});

			schema.version = -{return 'xyz'}
			service.run();
		end

		it 'should fire a ready status'
			a.should.be_true
		end

		it 'should not fire an installing status'
			b.should.be_false
		end

		it 'should not fire an upgrading status'
			c.should.be_false
		end
	end
end
