
describe 'TzReader'
	describe 'reading contents'
		it 'breaks data into multiple lines'
			reader = new Whendle.TzReader('a\nb')
			reader.next_line().should.equal 'a'
			reader.next_line().should.equal 'b'
		end
		
		it 'ignores empty lines'
			reader = new Whendle.TzReader('a\n\nb')
			reader.next_line().should.equal 'a'
			reader.next_line().should.equal 'b'
		end
		
		it 'ignores comment lines'
			reader = new Whendle.TzReader('a\n# X\nb')
			reader.next_line().should.equal 'a'
			reader.next_line().should.equal 'b'
		end
		
		it 'ignores comments at the ends of lines'
			reader = new Whendle.TzReader('a\nb # X\n\c')
			reader.next_line().should.equal 'a'
			reader.next_line().should.equal 'b'
			reader.next_line().should.equal 'c'
		end
	end
	
	describe 'reading rules'
		it 'ignores other lines'
			reader = new Whendle.TzReader('a\nRule X\nb')
			reader.next_rule().NAME.should.equal 'X'
			reader.next_rule().should.be_null
		end
	end
	
	describe 'reading rules by name'
		reader = new Whendle.TzReader('Rule X\nRule Y 1\nRule Y 2\nRule Z')
		
		it 'finds the first occurence of a rule'
			rule = reader.next_rule('Y')
			rule.should_not.be_null
			rule.NAME.should.equal 'Y'
			rule.FROM.should.equal '1'
		end
		
		it 'finds the next occurence of a rule'
			rule = reader.next_rule('Y')
			rule.should_not.be_null
			rule.NAME.should.equal 'Y'
			rule.FROM.should.equal '2'
		end
		
		it 'stops at the last occurence of a rule'
			rule = reader.next_rule('Y')
			rule.should.be_null
		end
	end	
	
	describe 'reading zones'
		it 'ignores other lines'
			reader = new Whendle.TzReader('a\nZone X/Y 0:00\nb')
			reader.next_zone().NAME.should.equal 'X/Y'
			reader.next_zone().should.be_null
		end
		
		it 'delineates multiple zone lines'
			reader = new Whendle.TzReader('Zone\tX/Y\t1:00\n\t\t\t2:00')
			reader.next_zone().NAME.should.equal 'X/Y'
			reader.next_zone().NAME.should.equal 'X/Y'
			reader.next_zone().should.be_null
		end
	end
	
	describe 'reading zones by name'
		reader = new Whendle.TzReader('Zone X/Y\nZone Y/Z\t1:00\n\t\t\t-1:00\nZone Z/X')
		
		it 'finds the first occurence of a zone'
			zone = reader.next_zone('Y/Z')
			zone.should_not.be_null
			zone.NAME.should.equal 'Y/Z'
			zone.GMTOFF.should.equal '1:00'
		end
		
		it 'find the next occurence of a zone'
			zone = reader.next_zone('Y/Z')
			zone.should_not.be_null
			zone.NAME.should.equal 'Y/Z'
			zone.GMTOFF.should.equal '-1:00'
		end
		
		it 'stops at the last occurence of a zone'
			zone = reader.next_zone('Y/Z')
			zone.should.be_null
		end	
	end
end
