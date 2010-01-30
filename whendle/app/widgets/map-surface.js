
Map_Surface = Class.create(Whendle.Observable, {
	IMAGE_FILE: 'resources/map-1040x520.png',
	
	initialize: function($super) {
		$super();
		this.load();
	},
	
	load: function() {
		var self = this;
		var image = new Image();
		image.onload = function() {
			self.image = image;
			self.fire(':ready');
		};

		image.src = this.IMAGE_FILE;
	},
	
	ready: function() {
		return this.image !== undefined;
	},
	
	draw: function(ctx, extent) {
		if (!this.ready()) return;
		
		ctx.drawImage(
			this.image,
			0, 0, this.image.width, this.image.height,
			0, 0, extent.x, extent.y
		);
	}
});