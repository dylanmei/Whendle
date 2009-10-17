
Whendle.Location = Class.create({
	initialize: function(name, area, country, latitude, longitude) {
		this.name = name || '';
		this.area = area || '';
		this.country = country || '';
		this.latitude = latitude || 0;
		this.longitude = longitude || 0;
		this.place = this.format_place();
	},
	
	format_place: function() {
		var has_area = this.area.length > 0;
		var has_country = this.country.length > 0;
		if (has_area && has_country) {
			return $L('location_place_area_country').interpolate(this);
		}
		else if (has_area) {
			return $L('location_place_area').interpolate(this);
		}
		else if (has_country) {
			return $L('location_place_country').interpolate(this);
		}
		
		return '';
	}
});