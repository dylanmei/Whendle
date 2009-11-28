describe 'TzDay'
	describe 'a day with no values'
		it 'should be empty'
			new Whendle.TzDay().empty().should.be_true
		end
	end
	
	describe 'a specific day in a month (ie, Sep 23)'
		it 'should be before dates that are after (ie, Oct 2)'
			new Whendle.TzDay('Sep', '23').before(new Date(2000, 9, 2)).should.be_true
			new Whendle.TzDay('Sep', '23').after(new Date(2000, 9, 2)).should.be_false
		end
		
		it 'should be after dates that are before (ie, Sep 10)'
			new Whendle.TzDay('Sep', '23').before(new Date(2000, 8, 10)).should.be_false
			new Whendle.TzDay('Sep', '23').after(new Date(2000, 8, 10)).should.be_true
		end
	end
	
	describe 'a relative day in a month (ie, Sep lastSun)'
		it 'should be before dates that are after (Sep 25, 2000)'
			new Whendle.TzDay('Sep', 'lastSun').before(new Date(2000, 8, 25)).should.be_true
			new Whendle.TzDay('Sep', 'lastSun').after(new Date(2000, 8, 25)).should.be_false
		end
		
		it 'should be after dates that are before (Sep 23, 2000)'
			new Whendle.TzDay('Sep', 'lastSun').before(new Date(2000, 8, 23)).should.be_false
			new Whendle.TzDay('Sep', 'lastSun').after(new Date(2000, 8, 23)).should.be_true
		end
	end
	
	describe 'a relative following day in a month (ie, Sun>=11)'
		it 'should be before dates that are after (Sep 18, 2000)'
			new Whendle.TzDay('Sep', 'Sun>=11').before(new Date(2000, 8, 18)).should.be_true
			new Whendle.TzDay('Sep', 'Sun>=11').after(new Date(2000, 8, 18)).should.be_false
		end
		
		it 'should be after dates that are before (Sep 16, 2000)'
			new Whendle.TzDay('Sep', 'Sun>=11').before(new Date(2000, 8, 16)).should.be_false
			new Whendle.TzDay('Sep', 'Sun>=11').after(new Date(2000, 8, 16)).should.be_true
		end
	end
	
	describe 'a relative preceeding day in a month (ie, Sun<=11)'
		it 'should be before dates that are after (Sep 11, 2000)'
			new Whendle.TzDay('Sep', 'Sun<=11').before(new Date(2000, 8, 11)).should.be_true
			new Whendle.TzDay('Sep', 'Sun<=11').after(new Date(2000, 8, 11)).should.be_false
		end
		
		it 'should be after dates that are before (Sep 9, 2000)'
			new Whendle.TzDay('Sep', 'Sun<=11').before(new Date(2000, 8, 9)).should.be_false
			new Whendle.TzDay('Sep', 'Sun<=11').after(new Date(2000, 8, 9)).should.be_true
		end
	end
end
