
Map_Clock = Class.create({
	WIDTH: 21,
	HEIGHT: 21,

	initialize: function() {
		this.canvas = new Element('canvas', { width: this.WIDTH, height: this.HEIGHT });
		new Element('div', { 'class': 'clock '})
			.hide()
			.insert(this.canvas);
		this.draw();
	},

	element: function() {
		return this.canvas.up();
	},

	width: function() {
		return this.canvas.width;
	},

	height: function() {
		return this.canvas.height;
	},

	time: function(time) {
		this.element().show();
		this.draw(time);
	},

	draw: function(time) {
		var ctx = this.canvas.getContext('2d');
		ctx.clearRect(0, 0, this.width(), this.height());

		if (time)
			this.draw_hands(ctx, time);
	},

	draw_hands: function(ctx, time) {
 		var x = this.width() / 2;
		var y = 2 + this.height() / 2;

		var angles = Time.angle_converter.convert(time);
		var m_angle = angles.minute * Math.PI / 180;
		var h_angle = angles.hour * Math.PI / 180;

		var hour_length = 5.5;
		var minute_length = 8;
		ctx.lineWidth = 0.75;
		ctx.strokeStyle = 'black';
		this.draw_hand(ctx, x, y, h_angle, hour_length, m_angle, minute_length);
	},

	draw_hand: function(ctx, x, y, hour_angle, hour_length, minute_angle, minute_length) {
		ctx.beginPath();

		ctx.moveTo(x, y);
		ctx.lineTo(x + hour_length * Math.sin(hour_angle), y - hour_length * Math.cos(hour_angle));
		ctx.moveTo(x, y);
		ctx.lineTo(x + minute_length * Math.sin(minute_angle), y - minute_length * Math.cos(minute_angle));
		ctx.stroke();
	}
});