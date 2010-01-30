
MapAssistant = Class.create(Whendle.Gallery.View, {
	initialize: function($super) {
		$super();
		new Whendle.Gallery.Presenter(this);

		var profile = Whendle.profile();
		profile.data('gallery', 'map');
	},
	
	setup: function() {
		this.model = {
			'items': []
		};

		this.menus = {
			visible: false,
			items: [
			{
				label: $L('View'),
				toggleCmd: 'map',
				items: [
					{ label: $L('Map'), iconPath: 'resources/menu-icon-globe.png', command: 'map' },
					{ label: $L('List'), iconPath: 'resources/menu-icon-list.png', command: 'list' }
				]
			},
			{ label: $.string('tip_find_a_location'), iconPath: 'resources/menu-icon-pin.png', command: 'add' }
		]};

		this.setup_widgets();
		this.attach_events();
		
		this.fire(Whendle.Event.loading);
	},
	
	setup_widgets: function() {
		this.growler = this.controller.get('growler');

		this.controller.setupWidget(Mojo.Menu.commandMenu, { menuClass: 'no-fade' }, this.menus);
		this.controller.setupWidget(this.growler.id, {});
		this.setup_map();
	},
	
	setup_map: function() {
		this.map = this.controller.get('map');

		var profile = Whendle.profile();
		var location = profile.data('location');
		var attributes = location ? { longitude: location.x, latitude: location.y } : undefined;
		this.controller.setupWidget(this.map.id, attributes);
	},
	
	attach_events: function() {
		this.controller.listen(this.growler.id, Mojo.Event.tap,
			this.growler.tap_handler = this.on_growler_tapped.bind(this));
		this.controller.listen(document, 'orientationchange',
			this.orientation_handler = this.on_orientation_changed.bind(this));
		this.controller.listen(this.map.id, ':location',
			this.map.location_handler = this.on_location_changed.bind(this));
	},
	
	loaded: function(event) {
		this.is_loaded = true;
		if (this.report_error(event.error)) return;

		var profile = Whendle.profile();
		var location = profile.data('location');
		
		var now = event.now;
		var map = this.map;
		
		map.mojo.sun(now.declination, now.hour_angle);
		map.mojo.draw();
		
		var clocks = event.clocks;
		for (var i = 0; i < clocks.length; i++) {
			var clock = clocks[i];
			var coordinate = { x: clock.longitude, y: clock.latitude };
			map.mojo.mark(clock.id, clock.title.escapeHTML(), clock.time, coordinate);
			if (i == 0 && location == null) {
				location = coordinate;
			}
		}

		map.mojo.flick(location);
	},
	
	added: function(event) {
		if (this.report_error(event.error)) return;
		
		var clock = event.clocks[0];
		var coordinate = { x: clock.longitude, y: clock.latitude };
		map.mojo.mark(clock.id, clock.title.escapeHTML(), clock.time, coordinate);
		map.mojo.flick(coordinate);
		
		this.growler.mojo.dismiss();
	},
	
	removed: function(event) {
	},
	
	changed: function(event) {
		var now = event.now;
		var map = this.map;
		
		map.mojo.sun(now.declination, now.hour_angle);
		map.mojo.draw();
		
		event.clocks.each(function(c) {
			var coordinate = { x: c.longitude, y: c.latitude };
			map.mojo.mark(c.id, c.title.escapeHTML(), c.time, coordinate);
		});
	},

	report_error: function(error) {
		if (!error) return false;
		$.trace('error ' + error.message);
		return true;
	},

	on_growler_tapped: function() {
		this.growler.mojo.dismiss();
	},

	on_orientation_changed: function(event) {
		var orientation = '';
		switch (event.position) {
			case 0: // face up
			case 1: // face down
			case 2: // normal portrait
				orientation = 'up';
				break;
			case 3: // reverse portrait
				orientation = 'up';
				break;
			case 4: // left-side-down landscape
				orientation = 'left';
				break;
			case 5: // right-side-down landscape
				orientation = 'right';
				break;
		}
		
		if (orientation.blank()) return;

		var stage_controller = this.controller.stageController;
		if (orientation == stage_controller.getWindowOrientation()) return;
		
		stage_controller.setWindowOrientation(orientation);
		this.map.mojo.orient(orientation);
	},
	
	on_location_changed: function(event) {
		var profile = Whendle.profile();
		profile.data('location', event.location);
		if (event.select) {
			Mojo.Controller.stageController.pushScene({ name: 'spotlight', disableSceneScroller: true }, event.select);
		}
	},

	activate: function(place) {
		this.controller.setMenuVisible(Mojo.Menu.commandMenu, true);

		if (!this.is_loaded) return;

		if (place && place.name) {
			var message = $.string('gallery_adding_location').interpolate(place);
			this.growler.mojo.spin(message.escapeHTML());
			this.fire(Whendle.Event.adding, { 'place': place });
		}
		else {
			var profile = Whendle.profile();
			var location = profile.data('location');
			if (location) {
				this.map.mojo.flick(location);
			}
		}
	},
	
	deactivate: function() {
	},
	
	cleanup: function() {
		this.detach_events();
	},
	
	detach_events: function() {
		this.controller.stopListening(this.growler, Mojo.Event.tap, this.growler.tap_handler);
		this.controller.stopListening(this.map, ':location', this.map.location_handler);
	}
});