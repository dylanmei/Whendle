
describe 'Startup Service'

	schema = new Object
	schema.max_version = -{return 'xyz'}
	schema.migrator = -{return null}
	service = new Whendle.StartupService(schema);

	describe 'with an empty schema'
		before
			a = false
			schema.migrator = -{a = true}
			schema.version = -{return null}
		end
		
		it 'should not be marked ready'
			service.ready().should.be_false
		end
		
		it 'should report a need to run an install operation'
			service.needs_install().should.be_true
		end
		
		it 'should run a schema update'
			service.run()
			a.should.be_true
		end
	end
	
	describe 'with an out of date schema'
		before
			a = false
			schema.migrator = -{a = true}
			schema.version = -{return 'abc'}
		end
		
		it 'should not be marked ready'
			service.ready().should.be_false
		end
		
		it 'should report a need to run an upgrade operation'
			service.needs_upgrade().should.be_true
		end

		it 'should run a schema update'
			service.run()
			a.should.be_true
		end
	end
	
	describe 'with an up-to-date schema'
		before
			a = false
			schema.migrator = -{a = true}
			schema.version = -{return 'xyz'}
		end
	
		it 'should be marked ready'
			service.ready().should.be_true
		end
		
		it 'should not report a need to run an install operation'
			service.needs_install().should.be_false
		end
		
		it 'should not report a need to run an upgrade operation'
			service.needs_upgrade().should.be_false
		end
		
		it 'should not run a schema update'
			service.run()
			a.should.be_false
		end
	end
end
