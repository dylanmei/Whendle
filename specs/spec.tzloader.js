
describe('TzLoader', function() {
	ajax = new Object();
	loader = new Whendle.TzLoader(ajax, 'tzdata/');

	before(function() {
		tzdata = undefined;
		error = undefined;
	});
	
	describe('When loading a typical zone', function() {
		before(function() {
			stub(ajax, 'load').and_return(function(file, on_complete) {
				on_complete('Zone Africa/Luanda');
			});
			
			loader.load('Africa/Luanda',
				function(results) { tzdata = results; },
				function(e) { error = e; }
			);
		});
		
		it('should provide the contents of the corresponding file', function() {
			expect(tzdata).to(equal, 'Zone Africa/Luanda');
		});
		
		it('should not provide an error', function() {
			expect(error).to(be_undefined);	
		});
	});
	
	describe('When loading a zone that is not in the default file', function() {
		before(function() {
			stub(ajax, 'load').and_return(function(file, on_complete) {
				if (file.endsWith('europe')) {
					on_complete('Zone Asia/Vladivostok');
				}
				else {
					on_complete('Zone ABC/XYZ');
				}
			});
			
			loader.load('Asia/Vladivostok',
				function(results) { tzdata = results; },
				function(e) { error = e; }
			);
		});

		it('should not provide the contents of the default file', function() {
			expect(tzdata).not_to(equal, 'Zone ABC/XYZ');
		});
		
		it('should provide the contents of the correct file', function() {
			expect(tzdata).to(equal, 'Zone Asia/Vladivostok');
		});
		
		it('should not provide and error', function() {
			expect(error).to(be_undefined);
		});
	});
	
	// ZONE=AREA/LOCATION1/LOCATION2
	describe('When loading a zone with an extra location deliniation', function() {
		before(function() {
			stub(ajax, 'load').and_return(function(file, on_complete) {
				on_complete('Zone America/Argentina/Buenos_Aires');
			});
			
			loader.load('America/Argentina/Buenos_Aires',
				function(results) { tzdata = results; },
				function(e) { error = e; }
			);
		});
		
		it('should provide the contents of the corresponding file', function() {
			expect(tzdata).to(equal, 'Zone America/Argentina/Buenos_Aires');
		});
		
		it('should not provide an error', function() {
			expect(error).to(be_undefined);	
		});		
	});
	
	// ZONE=AREA/LOCATION
	describe('When loading a zone with an area that does not exist', function() {
		before(function() {
			loader.load('XYZ/Seattle',
				function(results) { tzdata = results },
				function(e) { error = e; }
			);
		});
		
		it('should not provide results', function() {
			expect(tzdata).to(be_undefined);
		});
		
		it('should provide an error', function() {
			expect(error).to(have_property, 'message', 'XYZ/Seattle does not exist');
		});
	});
	
	// ZONE=AREA/LOCATION
	describe('When loading a zone with a location that does not exist', function() {
		before(function() {
			stub(ajax, 'load').and_return(function(file, on_complete) {
				on_complete('Zone ABC/XYZ');
			});
			
			loader.load('Asia/Shambala',
				function(results) { tzdata = results; },
				function(e) { error = e; }
			);
		});
		
		it('should not provide results', function() {
			expect(tzdata).to(be_undefined);
		});
		
		it('should provide an error', function() {
			expect(error).to(have_property, 'message', 'Asia/Shambala does not exist');
		});
	});
	
	describe('When loading a file causes an error', function() {
		before(function() {
			stub(ajax, 'load').and_return(function(a, b, on_error) {
				on_error({ message: 'oh pooh' });
			});
			
			loader.load('Antarctica/Casey',
				function(results) { tzdata = results; },
				function(e) { error = e; }
			);
		});
		
		it('should not provide results', function() {
			expect(tzdata).to(be_undefined);
		});
		
		it('should provide an error', function() {
			expect(error).to(have_property, 'message', 'oh pooh');
			expect(error).to(have_property, 'timezone', 'Antarctica/Casey');
			expect(error).to(have_property, 'file', 'tzdata/antarctica');
		});
	});
});
