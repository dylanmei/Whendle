
describe 'TzLoader'
	before_each
		ajax = new Object()
		loader = new Whendle.TzLoader(ajax, 'tzdata/')
	end
	
	describe 'loading a zone'
		it 'should provide the contents of the corresponding file'
			ajax.load = function(file, on_complete) {
				on_complete('Zone Africa/Luanda');
			};
			
			a = ''
			loader.load('Africa/Luanda', function(contents) { a = contents; })
			a.should.equal 'Zone Africa/Luanda'
		end
		
		it 'should provide the contents of an alternate file'
			ajax.load = function(file, on_complete) {
				on_complete(file.endsWith('europe') ? 'Zone Asia/Vladivostok' : 'Zone Asia/XYZ');
			}
			
			a = ''
			loader.load('Asia/Vladivostok', function(contents) { a = contents; });
			a.should.equal 'Zone Asia/Vladivostok'
		end
		
		it 'should propogate errors'
			ajax.load = function(file, on_complete, on_error) {
				on_error({});
			}
			
			e = null
			loader.load('Africa/Luanda', Prototype.emptyFunction, function(error) { e = error; });
			e.should_not.be_null
		end
	end
	
	describe 'loading a zone with an extra location deliniation'
		it 'should provide the contents of the corresponding file'
			ajax.load = function(file, on_complete) {
				on_complete('Zone America/Argentina/Buenos_Aires');
			};
			
			a = ''
			loader.load('America/Argentina/Buenos_Aires', function(contents) { a = contents; })
			a.should.equal 'Zone America/Argentina/Buenos_Aires'
		end	
	end
	
	describe 'loading a zone with a non-existant area component'
		before_each
			ajax.load = Prototype.emptyFunction;
		end
		
		it 'should not provide any results'
			a = ''
			loader.load('XYZ/Atlantis', function(contents) { a = contents; });
			a.should.equal ''
		end
		
		it 'should provide an error'
			e = null
			loader.load('XYZ/Atlantis', Prototype.emptyFunction, function(error) { e = error; })
			e.should_not.be_null
		end
	end
	
	describe 'loading a zone with a non-existant location component'
		before_each
			ajax.load = function(file, on_complete) { on_complete('Zone Asia/Vladivostok'); }
		end
		
		it 'should not provide any results'
			a = ''
			loader.load('Asia/Atlantis', function(contents) { a = contents; });
			a.should.equal ''
		end
		
		it 'should provide an error'
			e = null
			loader.load('Asia/Atlantis', Prototype.emptyFunction, function(error) { e = error; })
			e.should_not.be_null
		end	
	end
	
	describe 'raising loading errors'
		before_each
			e = null
			ajax.load = function(file, on_complete, on_error) {
				on_error({ message: 'oh pooh' });
			}
			
			loader.load('Antarctica/Casey', Prototype.emptyFunction, function(error) { e = error; });
		end
		
		it 'should provide an error message'
			e.should.have_property 'message', 'oh pooh'
		end
		
		it 'should provide a the timezone name'
			e.should.have_property 'timezone', 'Antarctica/Casey'
		end
		
		it 'should provide the file name'
			e.should.have_property 'file', 'tzdata/antarctica'
		end
	end
end
