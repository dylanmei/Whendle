
Map_Clock = Class.create({
	WIDTH: 21,
	HEIGHT: 21,
	
	initialize: function() {
		this.canvas = new Element('canvas', { width: this.WIDTH, height: this.HEIGHT });
		this.draw();
	},
	
	element: function() {
		return this.canvas;
	},
	
	width: function() {
		return this.canvas.width;
	},
	
	height: function() {
		return this.canvas.height;
	},
	
	time: function(time) {
		this.draw(time);
	},
	
	draw: function(time) {
		var ctx = this.canvas.getContext('2d');
		ctx.clearRect(0, 0, this.width(), this.height());
		
		this.draw_circle(ctx);
		if (time)
			this.draw_hands(ctx, time);
	},
	
	draw_circle: function(ctx) {
		var style = 'rgba(255,255,255,1)';
		var radius = (this.width() - 2) / 2;
		var x = this.width() / 2;
		var y = this.height() / 2;
		
		ctx.fillStyle = style;
		ctx.beginPath();
		ctx.arc(x, y, radius, 0, Math.PI * 2, true);
		ctx.fill();
	},
	
	draw_hands: function(ctx, time) {
		var angles = Time.angle_converter.convert(time);
 
		var m_angle = angles.minute * Math.PI / 180;
		var h_angle = angles.hour * Math.PI / 180;
 
		var hour_length = 5;
		var min_length = 7;
 		var x = this.width() / 2;
		var y = this.height() / 2;

		ctx.lineWidth = 0.75;
		ctx.beginPath();
		ctx.moveTo(x, y);
		ctx.lineTo(x + hour_length * Math.sin(h_angle), y - hour_length * Math.cos(h_angle));
		ctx.moveTo(x, y);
		ctx.lineTo(x + min_length * Math.sin(m_angle), y - min_length * Math.cos(m_angle));
		ctx.stroke();		
	}
});