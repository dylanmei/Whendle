
MapAssistant = Class.create(Whendle.Gallery.View, {
	initialize: function($super) {
		$super();
		this.presenter = new Whendle.Gallery.Presenter(this);

		var profile = Whendle.profile();
		profile.set('gallery', 'map');
	},

	setup: function() {

		this.model = {
			'items': []
		};

		this.setup_menus();
		this.setup_widgets();
		this.attach_events();

		this.fire(Whendle.Gallery.Events.loading);
	},

	setup_menus: function() {
		var menu = {};
		Object.extend(menu, StageAssistant.Gallery_menu);
		menu.attributes.menuClass = 'no-fade';
		menu.model.items[0].toggleCmd = 'map';
		this.controller.setupWidget(Mojo.Menu.commandMenu, menu.attributes, menu.model);
	},

	setup_widgets: function() {
		this.growler = this.controller.get('growler');
		this.controller.setupWidget(this.growler.id, {});
		this.setup_map();
	},

	setup_map: function() {
		this.map = this.controller.get('map');
		var profile = Whendle.profile();
		var location = profile.get('location');
		var attributes = location ? { longitude: location.x, latitude: location.y } : undefined;
		this.controller.setupWidget(this.map.id, attributes);
	},

	attach_events: function() {
		this.controller.listen(this.growler.id, Mojo.Event.tap,
			this.growler.tap_handler = this.on_growler_tapped.bind(this));
		this.controller.listen(this.map.id, ':location',
			this.map.location_handler = this.on_location_changed.bind(this));
	},

	loaded: function(event) {
		this.is_loaded = true;
		if (this.report_error(event.error)) return;

		var profile = Whendle.profile();
		var location = profile.get('location');

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
		this.map.mojo.mark(clock.id, clock.title.escapeHTML(), clock.time, coordinate);
		this.map.mojo.flick(coordinate);

		this.growler.mojo.dismiss();
	},

	removed: function(event) {
	},

	ordered: function(event) {
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
		this.growler.mojo.info(error.message, 4);
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
		profile.set('location', event.location);
		if (event.select) {
			Mojo.Controller.stageController.pushScene({ name: 'spotlight', disableSceneScroller: true }, event.select);
		}
	},

	activate: function(place) {
		this.controller.sceneElement.up('body').addClassName('map-body');

		this.controller.setMenuVisible(Mojo.Menu.commandMenu, true);
		this.controller.listen(document, 'orientationchange',
			this.orientation_handler = this.on_orientation_changed.bind(this));

		if (!this.is_loaded) return;

		if (place && place.name) {
			var message = $L('Adding #{name}...').interpolate(place);
			this.growler.mojo.spin(message.escapeHTML());
			this.fire(Whendle.Gallery.Events.adding, { 'place': place });
		}
		else {
			// reload
			this.fire(Whendle.Gallery.Events.loading);
		}
	},

	deactivate: function() {
		this.controller.sceneElement.up('body').removeClassName('map-body');
		this.controller.stopListening(document,
			'orientationchange', this.orientation_handler);
	},

	cleanup: function() {
		this.detach_events();
		this.presenter.destroy();
	},

	detach_events: function() {
		this.controller.stopListening(this.growler, Mojo.Event.tap, this.growler.tap_handler);
		this.controller.stopListening(this.map, ':location', this.map.location_handler);
	}
});