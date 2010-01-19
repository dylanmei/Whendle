
MapAssistant = Class.create(Whendle.Gallery.View, {
	initialize: function($super) {
		$super();
		new Whendle.Gallery.Presenter(this);
	},
	
	// 	event = {
	//		clocks: [{ id:#, name:'', place:'', time:'', day:'', latitude:#, longitude:# }],
	//		error: { message:'' }
	//	}
	loaded: function(event) {
		var now = event.now;
		this.map.mojo.sun(now.declination, now.hour_angle);
		this.map.mojo.draw();
	},
	
	added: function(event) {
	},
	
	removed: function(event) {
	},
	
	// 	event = {
	//		clocks: [{ id:#, name:'', place:'', time:'', day:'', latitude:#, longitude:# }],
	//		reason: '',
	//		error: { message:'' }
	//	}
	changed: function(event) {
		var now = event.now;
		this.map.mojo.sun(now.declination, now.hour_angle);
		this.map.mojo.draw();
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
					{ label: $L('Map'), iconPath: 'resources/menu-icon-map.png', command: 'map' },
					{ label: $L('List'), iconPath: 'resources/menu-icon-list.png', command: 'list' }
				]
			},
			{ label: $.string('tip_find_a_location'), icon: 'new', command: 'add' }
		]};

		this.setup_widgets();
		this.attach_events();
		
		this.fire(Whendle.Event.loading);
	},
	
	setup_widgets: function() {
		this.growler = this.controller.get('growler');
		this.map = this.controller.get('map');

		this.controller.setupWidget(Mojo.Menu.commandMenu, { menuClass: 'no-fade' }, this.menus);
		this.controller.setupWidget(this.growler.id, {});
		this.controller.setupWidget(this.map.id, {}, this.model);
	},
	
	attach_events: function() {
		this.controller.listen(this.growler.id, Mojo.Event.tap,
			this.growler.tap_handler = this.on_growler_tapped.bind(this));
	this.controller.listen(document, 'orientationchange',
		this.orientation_handler = this.on_orientation_changed.bind(this));
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

	activate: function() {
		this.controller.setMenuVisible(Mojo.Menu.commandMenu, true);
	},
	
	deactivate: function() {
	},
	
	cleanup: function() {
		this.detach_events();
	},
	
	detach_events: function() {
		this.controller.stopListening(this.growler, Mojo.Event.tap, this.growler.tap_handler);
	}
});