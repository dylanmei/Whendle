
Mojo.Widget.Map = Class.create({
	initialize: function() {
		this.longitude = this.latitude = 0;
	},
	
	setup: function() {
		var id = this.make_identifier();
		this.render_widget(id);
		this.setup_children(id);
		this.attach_events();
		this.load_resources();
		this.controller.exposeMethods([]);
		
		this.go({ x: 0, y: 0 });
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
		this.surface = new MapSurface();
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

	location: function() {
		return {
			  x: this.longitude
			, y: this.constrain_latitude_to_viewport(this.latitude)
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

	go: function(coordinate) {
		this.longitude = coordinate.x;
		this.latitude = coordinate.y;
		
		var position = this.coordinate_to_point(coordinate);
		var extent = this.extent();
		var viewport = this.viewport();
		
		var seam_x = extent.x;
		var core_x = (viewport.x / 2) - position.x;
		
		if (core_x > 0) {
			seam_x = core_x - extent.x;
		}
		
		if (core_x + extent.x < viewport.x) {
			seam_x = core_x + extent.x;
		}
		
		this.move_canvas(this.core, core_x, 0);
		this.move_canvas(this.seam, seam_x, 0);
	},

	move_canvas: function(canvas, x, y) {
		canvas.setStyle({
			  left: x + 'px'
			, top: y + 'px'
		});
	},

	draw: function() {
		var ctx = this.core.getContext('2d');
		this.surface.draw(ctx, this.extent());
			
//		this.draw_terminator(ctx);
//		this.draw_places(ctx);

//		this.draw_seam_canvas(ctx.canvas,
//			this.seam.getContext('2d'));
		
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
		var position = {
			x: location.x * scale.x,
			y: location.y * scale.y
		}

		var target = {
			x: position.x + (velocity.x * 0.2),
			y: position.y + (velocity.y * 0.2)
		};
		
		var step = 0;
		var steps = 20;
		var self = this;

		if (this.animator) this.animator.stop();
		this.animator = new PeriodicalExecuter(function(pe) {
			if (++step == steps) pe.stop();

			var x = self.flick_decay(position.x, target.x, step, steps) / -scale.x;
			var y = self.flick_decay(position.y, target.y, step, steps) / scale.y;
			
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

