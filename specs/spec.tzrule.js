
describe('TzRule', function() {
	
	describe('When making a typical rule object', function() {

		before(function() {
			rule = new Whendle.TzRule('Rule	Tunisia	1939	only	-	Apr	15	23:00s	1:00	S');
		});
		
		it('has a NAME value', function() {
			expect(rule.NAME).to(equal, 'Tunisia');
		});
		
		it('has a FROM value', function() {
			expect(rule.FROM).to(equal, '1939');
		});
		
		it('has a TO value', function() {
			expect(rule.TO).to(equal, 'only');
		});
		
		it('has a TYPE value', function() {
			expect(rule.TYPE).to(equal, '-');
		});
		
		it('has an IN value', function() {
			expect(rule.IN).to(equal, 'Apr');
		});
		
		it('has an ON value', function() {
			expect(rule.ON).to(equal, '15');
		});
		
		it('has an AT value', function() {
			expect(rule.AT).to(equal, '23:00s');
		});
		
		it('has a SAVE value', function() {
			expect(rule.SAVE).to(equal, '1:00');
		});
		
		it('has a LETTERS value', function() {
			expect(rule.LETTERS).to(equal, 'S');
		});
	});
});
