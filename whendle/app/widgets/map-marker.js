Map_Marker = Class.create(Whendle.Observable, {
	DROP_PADDING: 6,
	TEXT_LENGTH: 20,

	initialize: function($super, key) {
		$super();
		this.key = key;
		this.longitude = 0;
		this.latitude = 0;
		this.hour = 0;
		this.minute = 0;
		this.clock = new Map_Clock();

		this.setup();
	},

	setup: function() {
		this.element = new Element('div', { 'class': 'map-marker' })
			.insert(this.new_content())
			.insert(new Element('div', { 'class': 'pointer' }));
	},

	new_content: function() {
		var clock = this.clock.element();

		var label = new Element('div', { 'class': 'label' });
		var element = new Element('div', { 'class': 'content' })
			.insert(clock)
			.insert(label);

		var self = this;
		element.observe('click', function() {
			self.fire(':select', { mark: self });
		});
		return element;
	},

	text: function(v) {
		var el = this.element.down('.label');
		if (v === undefined) return el.innerHTML;
		el.innerHTML = this.format_text(v);
		return this;
	},

	format_text: function(text) {
		text = (text || '').strip();
		if (text.length == 0) return '?';
		if (text.length < this.TEXT_LENGTH) return text;

		return text
			.substring(0, this.TEXT_LENGTH)
			.strip()
			.concat($.string('truncate_ellipses'));
	},

	time: function(v) {
		if (v === undefined) return { hour: this.hour, minute: this.minute };

		this.hour = v.hour;
		this.minute = v.minute;

		this.clock.time(v);
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
			top: (point.y - size.y + this.DROP_PADDING) + 'px',
			zIndex: 100 + Math.floor(point.y)
		});
	}
});