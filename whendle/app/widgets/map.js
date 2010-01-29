
Mojo.Widget.Map = Class.create({
	initialize: function() {
		this.orientation = 'up';
		this.longitude = this.latitude = 0;
		this.marks = [];
	},
	
	setup: function() {
		var id = this.make_identifier();
		this.render_widget(id);
		this.setup_children(id);
		this.attach_events();
		this.load_resources();
		this.controller.exposeMethods(['sun', 'draw', 'orientate', 'mark', 'go']);
	},
	
	make_identifier: function() {
		return Mojo.View.makeUniqueId() +
			this.controller.scene.sceneId +
			this.controller.element.id;
	},
	
	render_widget: function(prefix) {
		var model = { 'id': prefix };
		var content = Mojo.View.render({
			  object: model
			, template: 'templates/map'
		});

		var element = this.controller.element;
		Element.insert(element, content);
		element.addClassName('map');
	},
	
	setup_children: function(prefix) {
		this.core = this.controller.get(prefix + '-core');
		this.seam = this.controller.get(prefix + '-seam');
		this.controller.instantiateChildWidgets();
	
		this.prepare_canvas();
		this.sunlight = new Map_Sunlight();
	},
	
	prepare_canvas: function() {
		var area = {
			  x: 1040
			, y: 520
		}
	
		this.core.width = area.x;
		this.core.height = area.y;
		this.core.setStyle({
			  position: 'fixed'
			, top: '0'
			, left: '0'
		});

		this.seam.width = area.x;
		this.seam.height = area.y;
		this.seam.setStyle({
			  position: 'fixed'
			, top: '0'
			, left: this.seam.width + 'px'
		});
	},
	
	load_resources: function() {
		this.surface = new Map_Surface();
		this.surface.observe(':ready', this.draw.bind(this));
	},

	scale: function() {
		var extent = this.extent();
		return {
			x: extent.x / 360,
			y: extent.y / 180
		}
	},
	
	extent: function(v) {
		return {
			x: this.core.width,
			y: this.core.height
		}
	},
	
	viewport: function(v) {
		return {
			  x: window.innerWidth
			, y: window.innerHeight
		}
	},
	
	orientate: function(v) {
		switch (v) {
			case 'up':
			case 'left':
			case 'right':
				this.orientation = v;
				break;
			case 'down':
			default:
				this.orientation = 'up';
				break;
		}
		this.go({
			x: this.longitude,
			y: this.latitude
		});
	},

	location: function() {
		return {
			x: this.longitude,
			y: this.constrain_latitude_to_viewport(this.latitude)
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
	},

	sun: function(dec, har) {
		this.sunlight.dec(dec);
		this.sunlight.har(har);
	},
	
	mark: function(key, text, time, location) {
		var mark = this.marks.find(function(m) {
			return m.key == key;
		});
		
		if (!mark) {
			mark = new Map_Marker(key);
			this.marks.push(mark);
			this.controller.element.insert(mark.element);
		}
		
		mark
			.text(text)
			.time(time)
			.location(location);
		
		this.move_marks();		
	},
	
	go: function(coordinate) {
		this.longitude = coordinate.x;
		this.latitude = coordinate.y;
		
		var position = this.coordinate_to_point(this.location());
		var extent = this.extent();
		var viewport = this.viewport();
		
		var seam_x = extent.x;
		var core_x = (viewport.x / 2) - position.x;
		var y = (viewport.y / 2) - position.y;
		
		if (core_x > 0) {
			seam_x = core_x - extent.x;
		}
		
		if (core_x + extent.x < viewport.x) {
			seam_x = core_x + extent.x;
		}
		
		this.move_canvas(this.core, core_x, y);
		this.move_canvas(this.seam, seam_x, y);
		this.move_marks();
		
		this.fire_location_changed(coordinate);
	},
	
	fire_location_changed: function(coordinate) {
		Mojo.Event.send(this.controller.element, ':location', { location: coordinate });
	},

	move_canvas: function(canvas, x, y) {
		canvas.setStyle({
			  left: x + 'px'
			, top: y + 'px'
		});
	},

	move_marks: function() {
		if (this.marks.length == 0) return;
		
		var scale = this.scale();
		var extent = this.extent();
		var viewport = this.viewport();
		var offset = this.translate_point(
			this.coordinate_to_point(this.location()));
		
		this.marks.each(function(m) {
			var where = {
				  x: offset.x + (extent.x / 2) + (m.longitude * scale.x)
				, y: offset.y + (extent.y / 2) + (m.latitude * -scale.y)
			}		
			
			var size = m.size();
			if (where.x + (size.x / 2) < 0) {
				where.x += extent.x;
			}
			else if (where.x - size.x / 2 > viewport.x) {
				where.x -= extent.x;
			}

			m.move(where);
		});
	},
	
	draw: function() {
		var ctx = this.core.getContext('2d');
		var extent = this.extent();
		var scale = this.scale();
		
		this.surface.draw(ctx, extent);
		this.sunlight.draw(ctx, extent, scale);
		
//		this.draw_places(ctx);

		ctx = this.seam.getContext('2d');
		ctx.drawImage(this.core, 0, 0);
	},
	
	attach_events: function() {
		this.controller.listen(this.controller.scene.sceneElement,
			Mojo.Event.dragStart, this.drag_start_handler = this.on_drag_start.bind(this));
		this.controller.listen(this.controller.scene.sceneElement,
			Mojo.Event.dragEnd, this.drag_end_handler = this.on_drag_end.bind(this));
		this.controller.listen(this.controller.scene.sceneElement,
			Mojo.Event.dragging, this.dragging_handler = this.on_dragging.bind(this));
		this.controller.listen(this.controller.scene.sceneElement,
			Mojo.Event.flick, this.flick_handler = this.on_flick.bind(this));
	},
	
	on_drag_start: function(event) {
		if (this.animator) this.animator.stop();
		event.down.location = this.location();
	},

	on_drag_end: function(event) {
		// don't always get one of these
	},

	on_dragging: function(event) {
		var current_offset = {
			  x: event.move.pointerX() - event.down.pointerX()
			, y: event.move.pointerY() - event.down.pointerY()	
		};

		var scale = this.scale();
		var coordinate_offset = {
			  x: current_offset.x / scale.x
			, y: current_offset.y / scale.y
		};
		
		var location = event.down.location;
		var go = {
			  x: location.x - coordinate_offset.x
			, y: location.y + coordinate_offset.y
		}
		
		if (go.x < -180) {
			go.x = 180 + go.x % 180;
		}
		else if (go.x > 180) {
			go.x = -180 + go.x % 180;
		}
		
		this.go(go);
	},

	on_flick: function(event) {
		var velocity = {
			x: event.velocity.x || 0,
			y: event.velocity.y || 0
		};
		
		var scale = this.scale();
		var location = this.location();

		var step = 0;
		var steps = 24;
		var self = this;

		if (this.animator) this.animator.stop();

		this.animator = new PeriodicalExecuter(function(pe) {
			if (++step == steps) pe.stop();

			var x = location.x + self.flick_decay(0, velocity.x * 0.2, step, steps) / -scale.x;
			var y = location.y + self.flick_decay(0, velocity.y * 0.2, step, steps) / scale.y;
			
			if (x < -180) x = 180 + x % 180;
			if (x > 180) x = -180 + x % 180;
			
			self.go({ x: x, y: y });

		}, 0.04, this.controller.window);
	},
	
	flick_decay: function(start, stop, step, total) {
		var diff = stop - start;
		if (diff == 0 || step >= total) return stop;

		var p = step / total;
		var t = Math.log(Math.abs(diff)); 
		return Math.round(stop - (diff * (1 / Math.pow(Math.E, t * p))));
	},

	cleanup: function() {
		this.detach_events();
	},
	
	detach_events: function() {
		this.controller.stopListening(this.controller.scene.sceneElement,
			Mojo.Event.dragStart, this.drag_start_handler);
		this.controller.stopListening(this.controller.scene.sceneElement,	
			Mojo.Event.dragEnd, this.drag_end_handler);
		this.controller.stopListening(this.controller.scene.sceneElement,
			Mojo.Event.dragging, this.dragging_handler);
		this.controller.stopListening(this.controller.scene.sceneElement,
			Mojo.Event.flick, this.flick_handler);
	}
});

