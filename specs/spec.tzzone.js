
describe('TzZone', function() {
	
	describe('When making a typical zone object', function() {
		before(function() {
			zone = new Whendle.TzZone('Zone	Africa/Tunis	0:40:44 -	LMT	1881 May 12');
		});
		
		it('has a NAME value', function() {
			expect(zone.NAME).to(equal, 'Africa/Tunis');
		});
		
		it('has an GMTOFF value', function() {
			expect(zone.GMTOFF).to(equal, '0:40:44');
		});
		
		it('has a RULES value', function() {
			expect(zone.RULES).to(equal, '-');
		});
		
		it('has a FORMAT value', function() {
			expect(zone.FORMAT).to(equal, 'LMT');
		});
		
		it('has an UNTIL value', function() {
			expect(zone.UNTIL).to(equal, '1881 May 12');
		});
	});
	
	describe('When making a zone object with an extra location designation', function() {
		it('has a NAME value', function() {
			expect(
				new Whendle.TzZone('Zone America/Argentina/Cordoba -4:16:48 - LMT	1894 Oct 31').NAME
			).to(equal, 'America/Argentina/Cordoba');
		});
	});
});
