
describe 'Time'
	describe 'created from a date object'
		before_each
			d = new Date(2000, 5, 17, 13, 46, 22);
			t = new Time().date(d);
		end
		
		it 'should have represent the year'
			t.year().should.be d.getFullYear()
		end

		it 'should have represent the month'
			t.month().should.be d.getMonth() + 1
		end
		
		it 'should have represent the day'
			t.day().should.be d.getDate()
		end
		
		it 'should have represent the hour'
			t.hour().should.be d.getHours()
		end
		
		it 'should have represent the minute'
			t.minute().should.be d.getMinutes()
		end
		
		it 'should have represent the second'
			t.second().should.be d.getSeconds()
		end
	end
	
	describe 'setting time components'
		it 'should set the year'
			new Time().year(1).year().should.be 1
		end

		it 'should set the month'
			new Time().month(1).month().should.be 1
		end
		
		it 'should set the day'
			new Time().day(1).day().should.be 1
		end
		
		it 'should set the hour'
			new Time().hour(1).hour().should.be 1
		end
		
		it 'should set the minute'
			new Time().minute(1).minute().should.be 1
		end
		
		it 'should set the second'
			new Time().second(1).second().should.be 1
		end
	end

	describe 'adding time components'
		before_each
			a = new Time().date(new Date(2001, 0, 1, 1, 1, 1));
		end
		
		it 'should add the year'
			a.add(Time.years, 1).year().should.be 2002
		end

		it 'should add the month'
			a.add(Time.months, 1).month().should.be 2
		end
		
		it 'should add the day'
			a.add(Time.days, 1).day().should.be 2
		end
		
		it 'should add the hour'
			a.add(Time.hours, 1).hour().should.be 2
		end
		
		it 'should add the minute'
			a.add(Time.minutes, 1).minute().should.be 2
		end
		
		it 'should add the second'
			a.add(Time.seconds, 1).second().should.be 2
		end
	end
	
	describe 'comparing yesterday, today, and tomorrow'
		before_each
			a = Time.today().subtract(Time.days, 1)
			b = Time.today()
			c = Time.today().add(Time.days, 1)
		end

		it 'should rank yesterday less than today'
			a.compare(b).should.be -1
		end
		
		it 'should rank today greater than yesterday'
			b.compare(a).should.be 1
		end
		
		it 'should rank tomorrow greater than today'
			c.compare(b).should.be 1
		end
		
		it 'should rank today less than tomorrow'
			b.compare(c).should.be -1
		end
	end
end