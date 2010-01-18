
Map_Sunlight = Class.create({
	initialize: function(options) {
		this.options = Object.extend({
			har: 0,
			dec: 0
		}, options);
	},
	
	dec: function(v) {
		if (v === undefined) return this.options.dec;
		this.options.dec = v;
	},
	
	har: function(v) {
		if (v === undefined) return this.options.har;
		this.options.har = v;
	},
	
	draw: function(ctx, extent, scale) {
		ctx.fillStyle = 'rgba(0, 0, 40, 0.25)';
		this.draw_terminator(ctx, extent, scale, 1);

		ctx.fillStyle = 'rgba(0, 0, 40, 0.25)';
		this.draw_terminator(ctx, extent, scale, 0);

		ctx.fillStyle = 'rgba(0, 0, 40, 0.25)';
		this.draw_terminator(ctx, extent, scale, -1);
	},
	
	draw_terminator: function(ctx, extent, scale, offset) {
		var k = Math.PI / 180.0;
		var xorigin = (extent.x / 2);
		var yorigin = (extent.y / 2);

		var har = this.har();
		var dec = this.dec() > 0 ?
			Math.max(0.1, this.dec()) : this.dec() < 0 ?
				Math.min(this.dec(), -0.1) : 0.1;

		var xoffset = offset * (scale.x / 10);
		var yoffset = offset * (scale.y / 10);
		var xfx = xoffset * (23.5 / Math.abs(dec));
		var yfx = yoffset * 20;

		ctx.beginPath();
		for (var i = 0; i <= 360; i++) {
			var lng = i + har + 180;
			var tl = -Math.cos(lng * k) / Math.tan(dec * k) + xfx;
			var al = Math.atan(tl) / k + yfx;
			var y =  yorigin - (scale.y * al);
			var x = (i - 180) * scale.x + xorigin;

			if (i == 0) ctx.moveTo(x, y);
			else {
				ctx.lineTo(x, y);
			}
		}

		var ypole = dec < 0 ? 0 : extent.y;
		ctx.lineTo(extent.x, ypole);
		ctx.lineTo(0, ypole);
		ctx.closePath();
		
		ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
		ctx.fill();
	}
});