
Mojo.Widget.Tyler = Class.create({
	TILE_X: 256,
	TILE_Y: 256,
	TILE_EMPTY: 'resources/tyler-empty.png',
	TILE_TEMPLATE: 'http://a.tile.openstreetmap.org/#{z}/#{x}/#{y}.png',
	OSM_NOTE: 'Data CC-By-SA by OpenStreetMap',
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
		this.blank();
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
	
	blank: function() {
		var tiles = this.new_tiles();
		this.blank_tiles(tiles);
	},
	
	build: function() {
		var tiles = this.new_tiles();
		this.load_tiles(tiles);
	},
	
	new_tiles: function() {
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
		
		return tiles;
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

		return tile;
	},
	
	blank_tiles: function(tiles) {
		var self = this;
		tiles.each(function(tile) {
			if (tile.visible)
				self.load_image(self.TILE_EMPTY, tile)
		});
	},
	
	load_image: function(src, tile) {
		if (Object.isUndefined(tile.image)) {
			tile.image = new Image();
			tile.image.onload = this.on_image_loaded.bind(this, tile);
		}

		tile.image.src = src;
	},
	
	load_tiles: function(tiles) {
		this.busy = true;
		this.requests = [];
	
		var self = this;
		var zoom = self.attributes.magnification;

		tiles.each(function(tile) {
			if (tile.visible) {
				var url = self.tile_url(tile.xindex, tile.yindex, zoom);
				self.requests.push(url);
				self.load_image(url, tile);
			}
		});	
	},
	
	on_image_loaded: function(tile) {
		var ctx = this.canvas.getContext('2d');
		var image = tile.image;

		ctx.drawImage(tile.image, tile.x, tile.y, this.TILE_X, this.TILE_Y);

		if (this.pending_request(image.src)) {
			this.requests = this.requests.without(image.src);
			if (this.requests.length == 0) {
				this.draw_osm_note(ctx);
				this.ready();
			}
		}
	},
	
	pending_request: function(url) {
		return this.requests && this.requests.indexOf(url) != -1;
	},
	
	draw_osm_note: function(ctx) {
		ctx.font = '11px sans-serif';
		ctx.textBaseline = 'bottom';
		ctx.fillStyle = 'rgba(0,0,0,0.75)';
		ctx.fillText(this.OSM_NOTE, 20, this.canvas.height - 2);
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