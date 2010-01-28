
Tyler = Class.create({
	TILE_X: 256,
	TILE_Y: 256,
	TILE_EMPTY: 'tyler-empty.png',
	TILE_TEMPLATE: 'http://a.tile.openstreetmap.org/#{z}/#{x}/#{y}.png',
	DEFAULT_ZOOM: 11,
	DEFAULT_LONGITUDE: -122.038254,
	DEFAULT_LATITUDE: 37.371609,
	
	initialize: function(element) {
		this.busy = false;
		this.element = element;
	},
	
	setup: function(attributes) {
		var container = this.element.getOffsetParent();
		this.attributes = Object.extend({
			width: 320,
			height: 320,
			latitude: this.DEFAULT_LATITUDE,
			longitude: this.DEFAULT_LONGITUDE,
			magnification: this.DEFAULT_ZOOM
		}, attributes || {});
		
		this.element.width = this.attributes.width;
		this.element.height = this.attributes.height;
		
		//if (this.attributes.snapshot) {
		//	this.render(this.attributes.snapshot);
		//}
		//else {
		//	this.build();
		//}
	},
	
	go: function(longitude, latitude, magnification) {
		if (typeof(this.attributes) === undefined || this.busy) return;

		this.attributes.longitude = longitude || 0;
		this.attributes.latitude = latitude || 0;
		this.attributes.magnification = magnification || this.attributes.magnification;
		this.build();
	},
	
	observe: function(name, handler) {
		Event.observe(this.element, name, handler);
	},
	
	stopObserving: function(name, handler) {
		Event.stopObserving(this.element, name, handler);
	},

	snapshot: function() {
		//return this.element.toDataURL('image/png');
	},
	
	render: function(snapshot) {
	},
	
	build: function() {
		var size = 256 * Math.pow(2, this.attributes.magnification);
		var offset = {
			x: Math.floor((size - this.element.width) * -this.longitude_to_x(this.attributes.longitude)),
			y: Math.floor((size - this.element.height) * -this.latitude_to_y(this.attributes.latitude))
		};
		
		var grid = {
			rows: Math.ceil(this.element.height / this.TILE_X) + 1,
			cols: Math.ceil(this.element.width / this.TILE_Y) + 1
		};

		var tiles = [];
		for (var i = 0; i < grid.cols; i++) {
			for (var j = 0; j < grid.rows; j++) {
				tiles.push(this.new_tile(i, j, grid, offset));
			}
		}
		
		this.busy = true;
		this.requests = [];
		this.load_tiles(tiles);
//		this.load_tiles
//			.bind(this)
//			.defer(tiles);
	},
	
	new_tile: function(column, row, grid, offset) {
		var tile = {
			column: column,
			row: row,
			x: offset.x + (column * this.TILE_X),
			y: offset.y + (row * this.TILE_Y),
			visible: true
		}
		
		tile.xindex = tile.column;
		if (tile.x > this.element.width) {
			do {
				tile.xindex -= grid.cols;
				tile.x = offset.x + (tile.xindex * this.TILE_X);
			} while (tile.x > this.element.width);
			
			if (tile.x + this.TILE_X < 0) tile.visible = false;
		}
		else {
			while (tile.x < -this.TILE_X) {
				tile.xindex += grid.cols;
				tile.x = offset.x + (tile.xindex * this.TILE_X);
			}
			
			if (tile.x > this.element.width) tile.visible = false;
		}

		tile.yindex = tile.row;
		if (tile.y > this.element.height) {
			do {
				tile.yindex -= grid.rows;
				tile.y = offset.y + (tile.yindex * this.TILE_Y);
			} while (tile.y > this.element.height);
			
			if (tile.y + this.TILE_Y < 0) tile.visible = false;
		}
		else {
			while (tile.y < -this.TILE_Y) {
				tile.yindex += grid.rows;
				tile.y = offset.y + (tile.yindex * this.TILE_Y);
			}
			
			 if (tile.y > this.element.height) tile.visible = false;
		}

		if (tile.visible) {
			tile.image = new Image();
			tile.image.onload = this.on_tile_loaded.bind(this, tile);
			tile.image.src = this.TILE_EMPTY;
		}

		return tile;
	},
	
	load_tiles: function(tiles) {
		var self = this;
		tiles.each(function(t) {
			if (!t.visible) return;
			
			var url = self.tile_url(t.xindex, t.yindex, self.attributes.magnification);
			self.requests.push(t.image.src = url);
		});	
	},
	
	on_tile_loaded: function(tile) {
		var ctx = this.element.getContext('2d');
		var image = tile.image;

		ctx.drawImage(tile.image, tile.x, tile.y, this.TILE_X, this.TILE_Y);
		if (this.requests.indexOf(image.src) != -1) {
			this.requests = this.requests.without(image.src);
			if (this.requests.length == 0)
				this.ready();
		}
	},
	
	ready: function() {
		this.busy = false;
		Event.fire.delay(1, this.element, 'tyler:ready', false);
	},
	
	tile_url: function(x, y, z) {
		return this.TILE_TEMPLATE.interpolate({ x: x, y: y, z: z });
	},
	
	longitude_to_x: function(longitude) {
		return (longitude + 180) / 360;
	},
	
	latitude_to_y: function(latitude) {
		return (1 - Math.log(Math.tan(latitude * Math.PI / 180) + 1 / Math.cos(latitude * Math.PI / 180)) / Math.PI) / 2;
	}
});