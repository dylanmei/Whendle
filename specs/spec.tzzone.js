
describe('TzZone', function() {
	
	describe('When making a typical zone object', function() {
		before(function() {
			zone = new Whendle.TzZone('Zone	Africa/Tunis	0:40:44 -	LMT	1881 May 12');
		});
		
		it('has a NAME value', function() {
			expect(zone.NAME).to(equal, 'Africa/Tunis');
		});
		
		it('has an OFFSET value', function() {
			expect(zone.OFFSET).to(equal, '0:40:44');
		});
		
		it('has a RULE value', function() {
			expect(zone.RULE).to(equal, '-');
		});
		
		it('has a FORMAT value', function() {
			expect(zone.FORMAT).to(equal, 'LMT');
		});
		
		it('has an UNTIL value', function() {
			expect(zone.UNTIL).to(equal, '1881 May 12');
		});
	});
});
