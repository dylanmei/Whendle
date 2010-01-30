
describe 'Timezone'
	describe 'selecting a zone object'
	
		it 'should get the nearest by year'
			timezone = new Whendle.Timezone([
				a = new Whendle.TzZone('Zone	X/Y	0	-	f	1920'),
				b = new Whendle.TzZone('Zone	X/Y	0	-	f	1930'),
				c = new Whendle.TzZone('Zone	X/Y	0	-	f	1940')
			],
			[]);
			timezone.zone(new Date(1921, 0)).should.equal b
			timezone.zone(new Date(1931, 0)).should.equal c
		end
		
		it 'should get the nearest by month'
			timezone = new Whendle.Timezone([
				a = new Whendle.TzZone('Zone	X/Y	0	-	f	1920 May'),
				b = new Whendle.TzZone('Zone	X/Y	0	-	f	1930 May'),
				c = new Whendle.TzZone('Zone	X/Y	0	-	f	1940 May')
			],
			[]);
			
			timezone.zone(new Date(1930, 4)).should.equal b
			timezone.zone(new Date(1930, 5)).should.equal c
		end
		
		it 'should get the nearest by day'
			timezone = new Whendle.Timezone([
				a = new Whendle.TzZone('Zone	X/Y	0	-	f	1920 May 20'),
				b = new Whendle.TzZone('Zone	X/Y	0	-	f	1930 May 20'),
				c = new Whendle.TzZone('Zone	X/Y	0	-	f	1940 May 20')
			],
			[]);
			
			timezone.zone(new Date(1930, 4, 20)).should.equal b
			timezone.zone(new Date(1930, 4, 21)).should.equal c
		end
		
		it 'should get the nearest by hour'
			timezone = new Whendle.Timezone([
				a = new Whendle.TzZone('Zone	X/Y	0	-	f	1920 May 20 5:00'),
				b = new Whendle.TzZone('Zone	X/Y	0	-	f	1930 May 20 5:00'),
				c = new Whendle.TzZone('Zone	X/Y	0	-	f	1940 May 20 5:00')
			],
			[]);
			
			timezone.zone(new Date(1930, 4, 20, 4)).should.equal b
			timezone.zone(new Date(1930, 4, 20, 5)).should.equal c
		end
		
		it 'should get the nearest by minute'
			timezone = new Whendle.Timezone([
				a = new Whendle.TzZone('Zone	X/Y	0	-	f	1920 May 20 5:20'),
				b = new Whendle.TzZone('Zone	X/Y	0	-	f	1930 May 20 5:20'),
				c = new Whendle.TzZone('Zone	X/Y	0	-	f	1940 May 20 5:20')
			],
			[]);
			
			timezone.zone(new Date(1930, 4, 20, 5, 19)).should.equal b
			timezone.zone(new Date(1930, 4, 20, 5, 20)).should.equal c
		end
	end

	describe 'selecting a rule object by name'
		it 'should get the rule'
			timezone = new Whendle.Timezone([], [
				a = new Whendle.TzRule('Rule	X	1000	3000	-	Mar	lastSun	0:00	0	A'),
				b = new Whendle.TzRule('Rule	X	1000	3000	-	Oct	lastSun	0:00	0	B')
			]);
			
			timezone.rule('Z', new Date(2000, 0)).should.be_null
			timezone.rule('X', new Date(2000, 0)).should.equal b
		end
	end
	
	describe 'selecting a rule for times prior to DST'
		it 'should get the rule for ST'
			timezone = new Whendle.Timezone([], [
				a = new Whendle.TzRule('Rule	X	1918	1919	-	Mar	lastSun	0:00	0	A'),
				b = new Whendle.TzRule('Rule	X	1918	1919	-	Oct	lastSun	0:00	0	B')
			]);
			
			timezone.rule('X', new Date(1919, 0, 1)).should.equal b
		end
		
		it 'should return the rule for ST (from a previous year)'
			timezone = new Whendle.Timezone([], [
				a = new Whendle.TzRule('Rule	X	1917	only	-	Mar	lastSun	0:00	0	A'),
				b = new Whendle.TzRule('Rule	X	1917	only	-	Oct	lastSun	0:00	0	B'),
				c = new Whendle.TzRule('Rule	X	1918	1919	-	Mar	lastSun	0:00	0	C'),
				d = new Whendle.TzRule('Rule	X	1918	1919	-	Oct	lastSun	0:00	0	D')
			]);
			
			timezone.rule('X', new Date(1918, 0, 1)).should.equal b
		end		
	end
	
	describe 'selecting a rule for times during DST'
		it 'should return the rule for DST'
			timezone = new Whendle.Timezone([], [
				a = new Whendle.TzRule('Rule	X	1918	1919	-	Mar	lastSun	0:00	0	A'),
				b = new Whendle.TzRule('Rule	X	1918	1919	-	Oct	lastSun	0:00	0	B')
			]);
			
			timezone.rule('X', new Date(1919, 6, 1)).should.equal a
		end	
	end
	
	describe 'selecting the rule for times after DST'
		it 'should return the rule for ST'
			timezone = new Whendle.Timezone([], [
				a = new Whendle.TzRule('Rule	X	1918	1919	-	Mar	lastSun	0:00	0	A'),
				b = new Whendle.TzRule('Rule	X	1918	1919	-	Oct	lastSun	0:00	0	B')
			]);
			
			timezone.rule('X', new Date(1919, 11, 1)).should.equal b
		end
	end
	
	describe 'serializing a timezone to JSON'
		timezone = new Whendle.Timezone([
			new Whendle.TzZone('Zone	X/Y	0	-	f	1920'),
			new Whendle.TzZone('Zone	X/Y	0	-	f	1930')
		], [
			new Whendle.TzRule('Rule	X	1918	1919	-	Mar	lastSun	0:00	0	A'),
			new Whendle.TzRule('Rule	X	1918	1919	-	Oct	lastSun	0:00	0	B')
		]);
		
		a = timezone.json();
		
		it 'should serialize the name value'
			a.should.include '"name": "X/Y"'
		end
		
		it 'should serialize the zones'
			a.should.include '"zones":'
			a.should.include '"Zone	X/Y	0	-	f	1920"'
			a.should.include '"Zone	X/Y	0	-	f	1930"'
		end
		
		it 'should serialize the rules'
			a.should.include '"rules":'
			a.should.include '"Rule	X	1918	1919	-	Mar	lastSun	0:00	0	A"'
			a.should.include '"Rule	X	1918	1919	-	Oct	lastSun	0:00	0	B"'
		end
	end
	
	describe 'deserializing a timezone from JSON'
		timezone = new Whendle.Timezone()
			.json('{"name": "X/Y", "zones": ["Zone X/Y 0 - f 1920", "Zone X/Y 0 - f 1930"], "rules": ["Rule X 1918 1919 - Mar lastSun 0:00 0 A", "Rule X 1918 1919 - Oct lastSun 0:00 0 B"]}')
	
		it 'should deserialize the zones'
			timezone.zones.should.have_length 2
		end
		
		it 'should deserialize the rules'
			timezone.rules.should.have_length 2
		end
	end
end

