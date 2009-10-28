
describe('TzDay', function() {
	describe('When a day object has no values', function() {
		it('should be empty', function() {
			expect(new Whendle.TzDay().empty()).to(be_true);
		});
	});
	
	describe('When measuring a specific day in a month (ie, Sep 23)', function() {
		it('should be before dates that are after', function() {
			var day = new Whendle.TzDay('Sep', '23');
			var date = new Date(2000, 8, 24);
			expect(day.before(date)).to(be_true);
			expect(day.after(date)).to(be_false);
		});
		
		it('should be after dates that are before', function() {
			var day = new Whendle.TzDay('Sep', '23');
			var date = new Date(2000, 8, 22);
			expect(day.before(date)).to(be_false);
			expect(day.after(date)).to(be_true);
		});
		
		it('should equal dates that are the same', function() {
			var day = new Whendle.TzDay('Sep', '23', '1:00');
			expect(day.equals(new Date(2000, 8, 23, 1))).to(be_true);
		});
	});
	
	describe('When measuring a relative day in a month (ie, Sep lastSun)', function() {
		it('should be before dates that are after (2000)', function() {
			var day = new Whendle.TzDay('Sep', 'lastSun'); // Sep 24, 2000
			var date = new Date(2000, 8, 25);
			expect(day.before(date)).to(be_true);
			expect(day.after(date)).to(be_false);
		});
		
		it('should be after dates that are before (2000)', function() {
			var day = new Whendle.TzDay('Sep', 'lastSun'); // Sep 24, 2000
			var date = new Date(2000, 8, 23);
			expect(day.before(date)).to(be_false);
			expect(day.after(date)).to(be_true);
		});

		it('should equal dates that are the same (2000)', function() {
			var day = new Whendle.TzDay('Sep', 'lastSun', '1:00'); // Sep 24, 2000
			expect(day.equals(new Date(2000, 8, 24, 1))).to(be_true);
		});
		
		it('should be before dates that are after (2001)', function() {
			var day = new Whendle.TzDay('Sep', 'lastSun'); // Sep 30, 2001
			var date = new Date(2001, 9, 1);
			expect(day.before(date)).to(be_true);
			expect(day.after(date)).to(be_false);
		});
		
		it('should be after dates that are before (2001)', function() {
			var day = new Whendle.TzDay('Sep', 'lastSun'); // Sep 30, 2001
			var date = new Date(2001, 8, 29);
			expect(day.before(date)).to(be_false);
			expect(day.after(date)).to(be_true);
		});

		it('should equal dates that are the same (2001)', function() {
			var day = new Whendle.TzDay('Sep', 'lastSun', '1:00'); // Sep 30, 2001
			expect(day.equals(new Date(2001, 8, 30, 1))).to(be_true);
		});
	});
	
	describe('When measuring a day after a specific day in a month (ie, Sep Sun>=11)', function() {
		it('should be before dates that are after', function() {
			var day = new Whendle.TzDay('Sep', 'Sun>=11'); // Sep 17, 2000
			var date = new Date(2000, 8, 18);
			expect(day.before(date)).to(be_true);
			expect(day.after(date)).to(be_false);
		});
		
		it('should be after dates that are before', function() {
			var day = new Whendle.TzDay('Sep', 'Sun>=11'); // Sep 17, 2000
			var date = new Date(2000, 8, 16);
			expect(day.before(date)).to(be_false);
			expect(day.after(date)).to(be_true);
		});

		it('should equal dates that are the same', function() {
			var day = new Whendle.TzDay('Sep', 'Sun>=11', '1:00');
			expect(day.equals(new Date(2000, 8, 17, 1))).to(be_true);
		});
	});

	describe('When measuring a day before a specific day in a month (ie, Sep Sun<=11)', function() {
		it('should be before dates that are after', function() {
			var day = new Whendle.TzDay('Sep', 'Sun<=11'); // Sep 10, 2000
			var date = new Date(2000, 8, 11);
			expect(day.before(date)).to(be_true);
			expect(day.after(date)).to(be_false);
		});
		
		it('should be after dates that are before', function() {
			var day = new Whendle.TzDay('Sep', 'Sun<=11'); // Sep 10, 2000
			var date = new Date(2000, 8, 9);
			expect(day.before(date)).to(be_false);
			expect(day.after(date)).to(be_true);
		});

		it('should equal dates that are the same', function() {
			var day = new Whendle.TzDay('Sep', 'Sun<=11', '1:00'); // Sep 10, 2000
			expect(day.equals(new Date(2000, 8, 10, 1))).to(be_true);
		});
	});
});