
Whendle.Place = Class.create({
	initialize: function(id) {
		this.id = id || 0;
		this.woeid = 0;

		this.name = '';
		this.admin = '';
		this.country = '';

		this.latitude = 0;
		this.longitude = 0;

		this.timezone = '';
	}
});

Whendle.Place.Format_area = function(place) {
	var format = '';
	var has_admin = place.admin.length > 0;
	var has_country = place.country.length > 0;
	if (has_admin && has_country) {
		format = $L('#{admin}, #{country}');
	}
	else if (has_admin) {
		format = $L('#{admin}');
	}
	else if (has_country) {
		format = $L('#{country}');
	}

	return format.interpolate(place);
}

Whendle.Place.Format_day = function(today, other_day) {
	var here = today.clone().hour(0).minute(0).second(0);
	var there = other_day.clone().hour(0).minute(0).second(0);
	return there.compare(here) < 0
		? $L('Yesterday') : there.compare(here) > 0
			? $L('Tomorrow') : $L('Today');
}

Whendle.Place.Format_time = function(time, pattern) {
	var hour = time.hour()
	var minute = time.minute().toPaddedString(2);

	if (pattern == 'HH12') {
		var template = hour < 12 ? $L('#{hours}:#{minutes} am') : $L('#{hours}:#{minutes} pm');
		return template.interpolate({ 'hours': (hour % 12 || 12), 'minutes': minute });
	}

	hour = hour.toPaddedString(2);
	return $L('#{hours}:#{minutes}')
		.interpolate({ 'hours': hour, 'minutes': minute });
}