
describe('TzReader', function() {
	
	describe('When reading tzdata', function() {
		it('breaks it into multiple lines', function() {
			var reader = new Whendle.TzReader('a\nb');
			expect(reader.next_line()).to(equal, 'a');
			expect(reader.next_line()).to(equal, 'b');
		});
		
		it('ignores empty lines', function() {
			var reader = new Whendle.TzReader('a\n\nb');
			expect(reader.next_line()).to(equal, 'a');
			expect(reader.next_line()).to(equal, 'b');
		});
		
		it('ignores lines beginning with comments', function() {
			var reader = new Whendle.TzReader('a\n# X\nb');
			expect(reader.next_line()).to(equal, 'a');
			expect(reader.next_line()).to(equal, 'b');
		});
		
		it('ignores comments at the end of a line', function() {
			var reader = new Whendle.TzReader('a\nb # X\n\c');
			expect(reader.next_line()).to(equal, 'a');
			expect(reader.next_line()).to(equal, 'b');
			expect(reader.next_line()).to(equal, 'c');
		});
	});
	
	describe('When reading rules', function() {
		it('ignores other lines', function() {
			var reader = new Whendle.TzReader('a\nRule X\nb');
			expect(reader.next_rule().NAME).to(equal, 'X');
			expect(reader.next_rule()).to(be_null);
		});
	});
	
	describe('When reading zones', function() {
		it('ignores other lines', function() {
			var reader = new Whendle.TzReader('a\nZone X/Y 0:00\nb');
			expect(reader.next_zone().NAME).to(equal, 'X/Y');
			expect(reader.next_zone()).to(be_null);
		});
		
		it('delineates multiple zone lines', function() {
			var reader = new Whendle.TzReader('Zone\tX/Y\t1:00\n\t\t\t2:00');
			expect(reader.next_zone().NAME).to(equal, 'X/Y');
			expect(reader.next_zone().NAME).to(equal, 'X/Y');
		});
	});
});
