
describe('Timezone', function() {

	describe('When selecting the rule for times prior to DST', function() {
		it('should return the rule for ST', function() {
			var timezone = new Whendle.Timezone([], [
				new Whendle.TzRule('Rule	X	1918	1919	-	Mar	lastSun	0:00	0	A'),
				new Whendle.TzRule('Rule	X	1918	1919	-	Oct	lastSun	0:00	0	B')
			]);
			
			var rule = timezone.rule('X', new Date(1919, 0, 1));
			expect(rule).not_to(be_null);
			expect(rule.LETTERS).to(equal, 'B');
		});

		it('should return the rule for ST (from a previous year)', function() {
			var timezone = new Whendle.Timezone([], [
				new Whendle.TzRule('Rule	X	1917	only	-	Mar	lastSun	0:00	0	A'),
				new Whendle.TzRule('Rule	X	1917	only	-	Oct	lastSun	0:00	0	B'),
				new Whendle.TzRule('Rule	X	1918	1919	-	Mar	lastSun	0:00	0	C'),
				new Whendle.TzRule('Rule	X	1918	1919	-	Oct	lastSun	0:00	0	D')
			]);
			
			var rule = timezone.rule('X', new Date(1918, 0, 1));
			expect(rule).not_to(be_null);
			expect(rule.LETTERS).to(equal, 'B');
		});
	});
	
	describe('When selecting the rule for times during DST', function() {
		it('should return the rule for DST', function() {
			var timezone = new Whendle.Timezone([], [
				new Whendle.TzRule('Rule	X	1918	1919	-	Mar	lastSun	0:00	0	A'),
				new Whendle.TzRule('Rule	X	1918	1919	-	Oct	lastSun	0:00	0	B')
			]);
			
			var rule = timezone.rule('X', new Date(1919, 6, 1));
			expect(rule).not_to(be_null);
			expect(rule.LETTERS).to(equal, 'A');
		});
	});
	
	describe('When selecting the rule for times after DST', function() {
		it('should return the rule for ST', function() {
			var timezone = new Whendle.Timezone([], [
				new Whendle.TzRule('Rule	X	1918	1919	-	Mar	lastSun	0:00	0	A'),
				new Whendle.TzRule('Rule	X	1918	1919	-	Oct	lastSun	0:00	0	B')
			]);
			
			var rule = timezone.rule('X', new Date(1919, 11, 1));
			expect(rule).not_to(be_null);
			expect(rule.LETTERS).to(equal, 'B');
		});
	});
});
