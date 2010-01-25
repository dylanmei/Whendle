
Mojo.Widget.Tyler = Class.create({
	TILE_X: 256,
	TILE_Y: 256,
	TILE_EMPTY: 'tyler-empty.png',
	TILE_TEMPLATE: 'http://a.tile.openstreetmap.org/#{z}/#{x}/#{y}.png',
	DEFAULT_ZOOM: 11,
	DEFAULT_LONGITUDE: -122.038254,
	DEFAULT_LATITUDE: 37.371609,
	
	initialize: function() {
		this.busy = false;
	},
	
	setup: function() {
		this.attributes = Object.extend({
			width: 320,
			height: 400,
			longitude: this.DEFAULT_LONGITUDE,
			latitude: this.DEFAULT_LATITUDE,
			magnification: this.DEFAULT_ZOOM
		}, this.controller.attributes || {});

		var id = this.make_identifier();
		this.render_widget(id);
		this.canvas = this.controller.get(id + '-tyler');
		this.canvas.width = this.attributes.width;
		this.canvas.height = this.attributes.height;

		this.controller.exposeMethods(['go']);
	},
	
	make_identifier: function() {
		return Mojo.View.makeUniqueId() +
			this.controller.scene.sceneId +
			this.controller.element.id;
	},
	
	render_widget: function(prefix) {
		var model = { 'id': prefix };
		var content = Mojo.View.render({
			  object: model, template: 'templates/tyler'
		});

		this.controller.element
			.addClassName('tyler')
			.insert(content);
	},
	
	go: function(longitude, latitude, magnification) {
		if (Object.isUndefined(this.attributes) || this.busy) return;
		if (Object.isNumber(longitude)) this.attributes.longitude = longitude;
		if (Object.isNumber(latitude)) this.attributes.latitude = latitude;
		if (Object.isNumber(magnification)) this.attributes.magnification = magnification;

		this.build();
	},
	
	build: function() {
		var size = 256 * Math.pow(2, this.attributes.magnification);
		var offset = {
			x: Math.floor((size - this.canvas.width) * -this.longitude_to_x(this.attributes.longitude)),
			y: Math.floor((size - this.canvas.height) * -this.latitude_to_y(this.attributes.latitude))
		};
		
		var grid = {
			rows: Math.ceil(this.canvas.height / this.TILE_X) + 1,
			cols: Math.ceil(this.canvas.width / this.TILE_Y) + 1
		};

		var tiles = [];
		for (var i = 0; i < grid.cols; i++) {
			for (var j = 0; j < grid.rows; j++) {
				tiles.push(this.new_tile(i, j, grid, offset));
			}
		}
		
		this.busy = true;
		this.requests = [];
//		this.load_tiles
//			.bind(this)
//			.defer(tiles);
		this.load_tiles(tiles);
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
		if (tile.x > this.canvas.width) {
			do {
				tile.xindex -= grid.cols;
				tile.x = offset.x + (tile.xindex * this.TILE_X);
			} while (tile.x > this.canvas.width);
			
			if (tile.x + this.TILE_X < 0) tile.visible = false;
		}
		else {
			while (tile.x < -this.TILE_X) {
				tile.xindex += grid.cols;
				tile.x = offset.x + (tile.xindex * this.TILE_X);
			}
			
			if (tile.x > this.canvas.width) tile.visible = false;
		}

		tile.yindex = tile.row;
		if (tile.y > this.canvas.height) {
			do {
				tile.yindex -= grid.rows;
				tile.y = offset.y + (tile.yindex * this.TILE_Y);
			} while (tile.y > this.canvas.height);
			
			if (tile.y + this.TILE_Y < 0) tile.visible = false;
		}
		else {
			while (tile.y < -this.TILE_Y) {
				tile.yindex += grid.rows;
				tile.y = offset.y + (tile.yindex * this.TILE_Y);
			}
			
			 if (tile.y > this.canvas.height) tile.visible = false;
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
		var ctx = this.canvas.getContext('2d');
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
		Event.fire.delay(0.1, this.controller.element, 'tyler:ready', false);
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