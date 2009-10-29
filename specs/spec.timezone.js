
describe('Timezone (get zone)', function() {
	// todo
});

describe('Timezone (get rule)', function() {
	describe('When getting the rule for times prior to DST', function() {
		it('should return the rule for ST', function() {
			var timezone = new Whendle.Timezone([], [
				new Whendle.TzRule('Rule	X	1918	1919	-	Mar	lastSun	2:00	1:00	D'),
				new Whendle.TzRule('Rule	X	1918	1919	-	Oct	lastSun	2:00	0	S')
			]);
			
			var rule = timezone.rule('X', new Date(1919, 1, 1));
			expect(rule).not_to(be_null);
			expect(rule.LETTERS).to(equal, 'S');
		});
	});
	
	describe('When getting the rule for times during DST', function() {
		it('should return the rule for DST', function() {
			var timezone = new Whendle.Timezone([], [
				new Whendle.TzRule('Rule	X	1918	1919	-	Mar	lastSun	2:00	1:00	D'),
				new Whendle.TzRule('Rule	X	1918	1919	-	Oct	lastSun	2:00	0	S')
			]);
			
			var rule = timezone.rule('X', new Date(1919, 6, 1));
			expect(rule).not_to(be_null);
			expect(rule.LETTERS).to(equal, 'D');
		});
	});
	
	describe('When getting the rule for times after DST', function() {
		it('should return the rule for ST', function() {
			var timezone = new Whendle.Timezone([], [
				new Whendle.TzRule('Rule	X	1918	1919	-	Mar	lastSun	2:00	1:00	D'),
				new Whendle.TzRule('Rule	X	1918	1919	-	Oct	lastSun	2:00	0	S')
			]);
			
			var rule = timezone.rule('X', new Date(1919, 11, 1));
			expect(rule).not_to(be_null);
			expect(rule.LETTERS).to(equal, 'S');
		});
	});
});

describe('Timezone (get offset)', function() {
	// todo
});