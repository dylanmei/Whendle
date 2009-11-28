
describe 'TzZone'
	describe 'creating a zone object from a tzdata line'
		zone = zone = new Whendle.TzZone('Zone	Africa/Tunis	0:40:44	Tunisia	LMT	1881 May 12');
		
		it 'should have a NAME value'
			zone.NAME.should.be 'Africa/Tunis'
		end
		
		it 'should have a GMTOFF offset value'
			zone.GMTOFF.should.be '0:40:44'
		end
		
		it 'should have a RULES value'
			zone.RULES.should.be 'Tunisia'
		end
		
		it 'should have a FORMAT value'
			zone.FORMAT.should.be 'LMT'
		end
		
		it 'should have an UNTIL value'
			zone.UNTIL.should.be '1881 May 12'
		end
	end
	
	describe 'creating a zone object with an extra location designation'
		it 'should have the extra location in its NAME value'
			zone = new Whendle.TzZone('Zone America/Argentina/Cordoba -4:16:48 - LMT	1894 Oct 31')
			zone.NAME.should.be 'America/Argentina/Cordoba'
		end
	end
end