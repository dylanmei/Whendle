
describe('Timezone', function() {

	describe('When selecting the zoneinfo', function() {
		it('should return the nearest zoneinfo by year', function() {
			var timezone = new Whendle.Timezone([
				new Whendle.TzZone('Zone	X/Y	0	-	f	1920'),
				new Whendle.TzZone('Zone	X/Y	0	-	f	1930'),
				new Whendle.TzZone('Zone	X/Y	0	-	f	1940')
			],
			[]);
			
			expect(timezone.zone(new Date(1930, 5, 6)).UNTIL).to(equal, '1930');
		});
		
		it('should return the nearest zoneinfo by month', function() {
			var timezone = new Whendle.Timezone([
				new Whendle.TzZone('Zone	X/Y	0	-	f	1920 May'),
				new Whendle.TzZone('Zone	X/Y	0	-	f	1930 May'),
				new Whendle.TzZone('Zone	X/Y	0	-	f	1940 May')
			],
			[]);
			
			expect(timezone.zone(new Date(1930, 4)).UNTIL).to(equal, '1930 May');
			expect(timezone.zone(new Date(1930, 5)).UNTIL).to(equal, '1940 May');
		});
		
		it('should return the nearest zoneinfo by day', function() {
			var timezone = new Whendle.Timezone([
				new Whendle.TzZone('Zone	X/Y	0	-	f	1920 May 20'),
				new Whendle.TzZone('Zone	X/Y	0	-	f	1930 May 20'),
				new Whendle.TzZone('Zone	X/Y	0	-	f	1940 May 20')
			],
			[]);
			
			expect(timezone.zone(new Date(1930, 4, 20)).UNTIL).to(equal, '1930 May 20');
			expect(timezone.zone(new Date(1930, 4, 21)).UNTIL).to(equal, '1940 May 20');
		});

		it('should return the nearest zoneinfo by hour', function() {
			var timezone = new Whendle.Timezone([
				new Whendle.TzZone('Zone	X/Y	0	-	f	1920 May 20 5:00'),
				new Whendle.TzZone('Zone	X/Y	0	-	f	1930 May 20 5:00'),
				new Whendle.TzZone('Zone	X/Y	0	-	f	1940 May 20 5:00')
			],
			[]);
			
			expect(timezone.zone(new Date(1930, 4, 20, 4)).UNTIL).to(equal, '1930 May 20 5:00');
			expect(timezone.zone(new Date(1930, 4, 20, 5)).UNTIL).to(equal, '1940 May 20 5:00');
		});

		it('should return the nearest zoneinfo by minute', function() {
			var timezone = new Whendle.Timezone([
				new Whendle.TzZone('Zone	X/Y	0	-	f	1920 May 20 5:00'),
				new Whendle.TzZone('Zone	X/Y	0	-	f	1930 May 20 5:00'),
				new Whendle.TzZone('Zone	X/Y	0	-	f	1940 May 20 5:00')
			],
			[]);
			
			expect(timezone.zone(new Date(1930, 4, 20, 4, 59)).UNTIL).to(equal, '1930 May 20 5:00');
			expect(timezone.zone(new Date(1930, 4, 20, 5, 00)).UNTIL).to(equal, '1940 May 20 5:00');
		});
	});

	describe('When selecting the rule by name', function() {
		it('should not return a rule by another name', function() {
			var timezone = new Whendle.Timezone([], [
				new Whendle.TzRule('Rule	X	1000	3000	-	Mar	lastSun	0:00	0	A'),
				new Whendle.TzRule('Rule	X	1000	3000	-	Oct	lastSun	0:00	0	B')
			]);
			
			expect(timezone.rule('Y', new Date(2000, 0, 1))).to(be_null);
		});
	});

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
