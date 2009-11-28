
describe 'TzRule'
	describe 'creating a rule object from a tzdata line'
		rule = new Whendle.TzRule('Rule	Tunisia	1939	only	-	Apr	15	23:00s	1:00	S')
		
		it 'should have a NAME value'
			rule.NAME.should.be 'Tunisia'
		end
		
		it 'should have a FROM value'
			rule.FROM.should.be '1939'
		end
		
		it 'should have a TO value'
			rule.TO.should.be 'only'
		end
		
		it 'should have a TYPE value'
			rule.TYPE.should.be '-'
		end
		
		it 'should have an IN value'
			rule.IN.should.be 'Apr'
		end
		
		it 'should have an ON value'
			rule.ON.should.be '15'
		end
		
		it 'should have an AT value'
			rule.AT.should.be '23:00'
		end
		
		it 'should have a SAVE value'
			rule.SAVE.should.be '1:00'
		end
		
		it 'should have a LETTERS value'
			rule.LETTERS.should.be 'S'
		end
	end
end