
Map_Sunlight = Class.create({
	initialize: function(options) {
		this.options = Object.extend({
			tau: 0,
			dec: 0
		}, options);
	},
	
	dec: function(v) {
		if (v === undefined) return this.options.dec;
		this.options.dec = v;
	},
	
	tau: function(v) {
		if (v === undefined) return this.options.tau;
		this.options.tau = v;
	},
	
	draw: function(ctx, extent, scale) {
		var k = Math.PI / 180.0;
		var xorigin = (extent.x / 2);
		var yorigin = (extent.y / 2);

		ctx.beginPath();

		for (var i = 0; i <= 360; i++) {
			var x = (i - 180) * scale.x + xorigin;
			var lng = i + this.tau() + 180;
			var tl = -Math.cos(lng * k) / Math.tan(this.dec() * k);
			var al = Math.atan(tl) / k;
			var y =  yorigin - (scale.y * al);

			if (i == 0) ctx.moveTo(x, y);
			else {
				ctx.lineTo(x, y);
			}
		}

		var ypole = this.dec() < 0 ? 0 : extent.y;
		ctx.lineTo(extent.x, ypole);
		ctx.lineTo(0, ypole);
		ctx.closePath();
		
		ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
		ctx.fill();
	}
});