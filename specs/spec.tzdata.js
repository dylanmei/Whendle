describe 'TzData'

	ajax = new Whendle.AjaxService();
	loader = new Whendle.TzLoader(ajax, TZ.path);
	locator = new Whendle.Timezone_Locator(ajax, loader);
	now = new Date();

	describe 'All timezones'
		it 'should provide current zone data'

			TZ.names.each(function(name) {
				locator.load(name,
					function(timezone) {
						try {
							var zone = timezone.zone(now);
						}
						catch (e) {
							console.log(name, e)
						}
					},
					function(e) {
						console.log(e.message)
					})
			});
		end
		
		it 'should provide current rule data'

			TZ.names.each(function(name) {
				locator.load(name,
					function(timezone) {
						var zone = timezone.zone(now);
						try {
							var rule = timezone.rule(zone.RULES, now);
						}
						catch (e) {
							console.log(name, e)
						}
					},
					function(e) {
						console.log(e.message)
					})
			});
		end
	end
end
