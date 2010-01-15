
MapAssistant = Class.create({
	initialize: function() {
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
					{ label: $L('Map'), icon: 'refresh', command: 'map' },
					{ label: $L('List'), icon: 'search', command: 'list' }
				]
			},
			{ label: $.string('tip_find_a_location'), icon: 'new', command: 'add' }
		]};

		this.setup_widgets();
		this.attach_events();
		
//		this.fire(Whendle.Event.loading);
	},
	
	setup_widgets: function() {
		this.growler = this.controller.get('growler');
//		this.map = this.controller.get('map');

		this.controller.setupWidget(Mojo.Menu.commandMenu, {}, this.menus);
		this.controller.setupWidget(this.growler.id, {});
//		this.controller.setupWidget(this.map.id, {}, this.model);
	},
	
	attach_events: function() {
		this.controller.listen(this.growler.id, Mojo.Event.tap,
			this.growler.tap_handler = this.on_growler_tapped.bind(this));
	},
	
	on_growler_tapped: function() {
		this.growler.mojo.dismiss();
	},
	
	activate: function() {
		this.controller.setMenuVisible(Mojo.Menu.commandMenu, true);
		this.growler.mojo.info('Map assistant');
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