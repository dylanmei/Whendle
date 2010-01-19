
ListAssistant = Class.create(Whendle.Gallery.View, {
	name: function() {
		return 'list';
	},

	initialize: function($super) {
		$super();
		this._presenter = new Whendle.Gallery.Presenter(this);
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
				toggleCmd: 'list',
				items: [
					{ label: $L('Map'), iconPath: 'resources/menu-icon-map.png', command: 'map' },
					{ label: $L('List'), iconPath: 'resources/menu-icon-list.png', command: 'list' }
				]
			},
			{ label: $.string('tip_find_a_location'), iconPath: 'resources/menu-icon-find.png', command: 'add' }
		]};
		
		this.setup_widgets();
		this.attach_events();
		
		this.fire(Whendle.Event.loading);
	},
	
	setup_widgets: function() {
		this.growler = this.controller.get('growler');
		this.list = this.controller.get('list');
		
		this.controller.setupWidget(Mojo.Menu.commandMenu, {}, this.menus);
		this.controller.setupWidget(this.growler.id, {});
		this.controller.setupWidget(this.list.id, {
				itemTemplate: 'gallery/list-item',
				listTemplate: 'gallery/list',
				uniquenessProperty: 'id',
				swipeToDelete: true,
				autoconfirmDelete: true,
				renderLimit: 80,
				reorderable: false
			},
			this.model
		);
	},
	
	attach_events: function() {
		this.controller.listen(this.growler.id, Mojo.Event.tap,
			this.growler.tap_handler = this.on_growler_tapped.bind(this));
		this.controller.listen(this.list.id, Mojo.Event.listDelete,
			this.list.delete_handler = this.on_remove_clock.bind(this));
		this.controller.listen(this.list.id, Mojo.Event.listTap,
			this.list.tap_handler = this.on_clock_tapped.bind(this));
	},
	
	on_growler_tapped: function() {
		this.growler.mojo.dismiss();
	},
	
	on_clock_tapped: function(event) {
		var clock = event.item;
		Mojo.Controller.stageController.pushScene({ name: 'spotlight' }, clock);
	},
	
	on_remove_clock: function(event) {
		var clock = event.item;
		this.fire(Whendle.Event.removing, { 'id': clock.id });
	},
	
	loaded: function(event) {
		if (this.report_error(event.error)) return;

		this.model.items = event.clocks;
		this.controller.modelChanged(this.model, this);
		this.controller.setMenuVisible(Mojo.Menu.commandMenu, true);
	},

	added: function(event) {
		if (this.report_error(event.error)) return;
		
		this.model.items.push(event.clocks[0]);
		this.controller.modelChanged(this.model, this);
		this.growler.mojo.dismiss();
	},
	
	removed: function(event) {
		if (this.report_error(event.error)) return;

		clock = this.model.items.find(function(c) {
			return c.id == event.clocks[0].id;
		});
		
		if (clock) {
			this.model.items = this.model.items.without(clock);
			this.controller.modelChanged(this.model, this);
		}
	},
	
	changed: function(event) {
		if (this.report_error(event.error)) return;
		var clocks = event.clocks;
		var items = this.model.items;
		var changes = false;
		clocks.each(function(clock) {
			match = items.find(function(item) {
				return item.id == clock.id;
			});
			if (match) {
				changes = true;
				match.time = clock.time;
				match.day = clock.day;
			}
		});
		if (changes)
			this.controller.modelChanged(this.model, this);
	},
	
	report_error: function(error) {
		if (!error) return false;
		$.trace('error ' + error.message);
		return true;
	},

	activate: function(location) {
		if (location && location.name) {
			this.growler.mojo.spin('Adding ' + location.name + '...');
			// assuming we have come from the finder
			// after the user has found a location...
			this.fire(Whendle.Event.adding, { 'location': location });
		}
	},
	
	deactivate: function(event) {
	},
	
	cleanup: function(event) {
		this.detach_events();
	},
	
	detach_events: function() {
		this.controller.stopListening(this.growler, Mojo.Event.tap, this.growler.tap_handler);
		this.controller.stopListening(this.list, Mojo.Event.listDelete, this.list.delete_handler);
		this.controller.stopListening(this.list, Mojo.Event.listTap, this.list.tap_handler);
	}
});