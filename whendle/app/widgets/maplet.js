
Mojo.Widget.Maplet = Class.create({
	SURFACE_FILE: 'images/map-1040x520.png',

	initialize: function() {
 		this.longitude = this.latitude = 0;
	},

	setup: function() {
		this.attributes = Object.extend({
			width: 320,
			height: 480
		}, this.controller.attributes);

		var id = this.make_identifier();
		this.render_widget(id);
		this.setup_children(id);
		this.load_surface();
		this.controller.exposeMethods(['mark', 'draw']);
	},

	make_identifier: function() {
		return Mojo.View.makeUniqueId() +
			this.controller.scene.sceneId +
			this.controller.element.id;
	},

	setup_children: function(prefix) {
		this.canvas = this.controller.get(prefix + '-canvas');
		this.canvas.width = this.attributes.width;
		this.canvas.height = this.attributes.height;

		this.controller.instantiateChildWidgets();
		this.sunlight = new Map_Sunlight();
	},

 	render_widget: function(prefix) {
		var model = { 'id': prefix };
		var content = Mojo.View.render({
			  object: model
			, template: 'templates/maplet'
		});

		var element = this.controller.element;
		Element.insert(element, content);
		element.addClassName('maplet');
	},

	load_surface: function() {
		this.surface = new Image();
		this.surface.onload = this.surface_ready.bind(this);
		this.surface.src = this.SURFACE_FILE;
	},

	surface_ready: function() {
		this.surface.ready = true;
		this.redraw();
	},

	mark: function(name, location) {
		if (!this.marker) {
			this.marker = new Map_Marker();
			this.controller.element.insert(this.marker.element)
		}
		
$.trace('setting text', name);

		this.marker.text(name);
		if (location !== undefined) {
			this.longitude = location.x;
			this.latitude = location.y;
			this.move_marker();
		}
	},

	move_marker: function() {
		var scale = this.scale();
		var extent = this.extent();
		var viewport = this.viewport();
		var map_offset = this.translate_point(
			this.coordinate_to_point(this.location()));
		var scene_offset = this.controller.element.positionedOffset();

		var point = {
			  x: map_offset.x + scene_offset.left + (extent.x / 2) + (this.longitude * scale.x)
			, y: map_offset.y + scene_offset.top + (extent.y / 2) + (this.latitude * -scale.y)
		}

		this.marker.move(point);
	},

	draw: function(declination, hour_angle) {
		this.sunlight.ready = true;

		if (arguments.length == 2) {
			this.sunlight.dec(declination);
			this.sunlight.har(hour_angle);
		}

		this.redraw();
	},

	redraw: function() {
		if (this.surface.ready)
			this.draw_internal();
	},

	extent: function() {
		return {
			x: 1040,
			y: 520
		}
	},

	viewport: function() {
		return {
			x: this.canvas.width,
			y: this.canvas.height
		}
	},

	location: function() {
		return {
			  x: this.longitude
			, y: this.constrain_latitude_to_viewport(this.latitude)
		};
	},

	scale: function() {
		var extent = this.extent();
		return {
			x: extent.x / 360,
			y: extent.y / 180
		}
	},

	constrain_latitude_to_viewport: function(value) {
 		var underflow =
			this.extent().y -
			this.viewport().y;
		underflow /= this.scale().y;

		var min = -underflow / 2;
		var max = underflow / 2;

		var latitude = value;
		if (latitude < min)
			latitude = min;
		if (latitude > max)
			latitude = max;

		return latitude;
	},

	draw_internal: function() {
		var ctx = this.canvas.getContext('2d');
		this.draw_map(ctx);

		if (this.sunlight.ready)
			this.draw_sunlight(ctx);
	},

	draw_map: function(ctx) {
		var extent = this.extent();
		var viewport = this.viewport();
		var image = this.map_offset();
		var x = Math.floor(image.x);
		var y = Math.floor(image.y);

		ctx.drawImage(this.surface, x, y,
			extent.x,
			extent.y
		);

		if (image.x > 0) {
			ctx.drawImage(this.surface,
				x - extent.x,
				y,
				extent.x,
				extent.y
			);
		}

		if (image.x + extent.x < viewport.x) {
			ctx.drawImage(this.surface,
				x + extent.x,
				y,
				extent.x,
				extent.y
			);
		}
	},

	draw_sunlight: function(ctx) {
		var extent = this.extent();
		var image = this.map_offset();
		var x = Math.floor(image.x);
		var y = Math.floor(image.y);

		this.draw_terminator(ctx, { x: x, y: y });
		if (this.longitude < 0) this.draw_terminator(ctx, { x: x - extent.x, y: y });
		if (this.longitude > 0) this.draw_terminator(ctx, { x: x + extent.x, y: y });
	},

	draw_terminator: function(ctx, translate) {
		ctx.save();
		ctx.translate(translate.x, translate.y);
		this.sunlight.draw(ctx, this.extent(), this.scale());
		ctx.restore();
	},

	map_offset: function() {
		var location = this.location();
		return this.translate_point(
			this.coordinate_to_point({
				  x: location.x
				, y: location.y
			})
		);
	},

	coordinate_offset: function(coordinate) {
		return this.point_offset(
			this.coordinate_to_point({
				  x: coordinate.x
				, y: coordinate.y
			})
		);
	},

	point_offset: function(point) {
		var offset = this.map_offset();
		return {
			  x: point.x + offset.x
			, y: point.y + offset.y
		}
	},

	translate_point: function(point) {
		var viewport = this.viewport();
		var offset = {
			  x: 0
			, y: 0
		};

		offset.x -= point.x - (viewport.x / 2);
		offset.y += viewport.y / 2 - point.y;
		return offset;
	},

	coordinate_to_point: function(coordinate) {
		var scale = this.scale();
		var extent = this.extent();
		var point = {
			  x: extent.x / 2
			, y: extent.y / 2
		};

		point.x += coordinate.x * scale.x;
		point.y -= coordinate.y * scale.y;
		return point;
	},

	point_to_coordinate: function(point) {
		var extent = this.extent();
		var scale = this.scale();
		var offset = this.map_offset();

		var coordinate = {
			  x: (point.x - offset.x) - extent.x / 2
			, y: (offset.y - point.y) + extent.y / 2
		}

		coordinate.x /= scale.x;
		coordinate.y /= scale.y;

		return coordinate;
	}
});