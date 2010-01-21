Map_Marker = Class.create({
	DROP_PADDING: 6,

	initialize: function(key) {
		this.key = key;
		this.longitude = 0;
		this.latitude = 0;
		this.hour = 0;
		this.minute = 0;

		this.setup();
	},
	
	setup: function() {
		this.element = new Element('div', { 'class': 'map-marker' })
			.insert(this._content())
			.insert(new Element('div', { 'class': 'pointer' }));

//		document.body.insert(this.element);
	},
	
	_content: function() {
		var clock = new Element('div', { 'class': 'clock' })
			.insert(new Element('div', { 'class': 'hour' }))
			.insert(new Element('div', { 'class': 'minute' }));
		var label = new Element('div', { 'class': 'label' });
		return new Element('div', { 'class': 'content' })
			.insert(clock)
			.insert(label);
	},
	
	text: function(v) {
		var el = this.element.down('.label');
		if (v === undefined) return el.innerHTML;
		el.innerHTML = v;
		return this;
	},
	
	time: function(v) {
		if (v === undefined) return { hour: this.hour, minute: this.minute };
		this.hour = v.hour;
		this.minute = v.minute;
		
		var hour_element = this.element.down('.hour');
		var minute_element = this.element.down('.minute');
		var angle = Time.angle_converter.convert(v);
		hour_element.setStyle({
			'-webkit-transform': 'rotate(#{hour}deg)'.interpolate(angle)
		});
		minute_element.setStyle({
			'-webkit-transform': 'rotate(#{minute}deg)'.interpolate(angle)
		});
		
		return this;
	},
	
	position: function() {
		var s = this.size();
		var p = this.element.positionedOffset();
		return { x: p.left + size.x / 2, y: p.top + size.y + this.DROP_PADDING };
	},
	
	location: function(v) {
		if (v === undefined) return { x: this.longitude, y: this.latitude };
		this.longitude = v.x;
		this.latitude = v.y;
		return this;
	},
	
	size: function() {
		var d = this.element.getDimensions();
		return { x: d.width, y: d.height };
	},
	
	move: function(point) {
		var size = this.size();
		this.element.setStyle({
			left: (point.x - size.x / 2) + 'px',
			top: (point.y - size.y + this.DROP_PADDING) + 'px'
		});
	},
	
	hit: function(point) {
		var p = this.element.positionedOffset();
		if (point.x < p.left) return false;
		if (point.y < p.top) return false;

		var d = this.element.getDimensions();
		if (point.x > p.left + d.width) return false;
		if (point.y > p.top + d.height) return false;
		return true;
	}
});