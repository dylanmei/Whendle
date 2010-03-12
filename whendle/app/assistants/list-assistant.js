
ListAssistant = Class.create(Whendle.Gallery.View, {
	name: function() {
		return 'list';
	},

	initialize: function($super) {
		$super();
		this.presenter = new Whendle.Gallery.Presenter(this);

		var profile = Whendle.profile();
		profile.set('gallery', 'list');
	},

	setup: function() {
		this.model = {
			is_loaded: false,
			'items': []
		};

		this.setup_orientation();
		this.setup_menus();
		this.setup_widgets();
		this.attach_events();

		this.fire(Whendle.Gallery.Events.loading);
	},

	setup_orientation: function() {
		var stage_controller = this.controller.stageController;
		if (stage_controller.getWindowOrientation() != 'up')
			stage_controller.setWindowOrientation('up');
	},

	setup_menus: function() {
		var menu = {};
		Object.extend(menu, StageAssistant.Gallery_menu);
//		menu.attributes.menuClass = 'no-fade';
//		menu.model.visible = false;
		menu.model.items[0].toggleCmd = 'list';
		this.controller.setupWidget(Mojo.Menu.commandMenu, menu.attributes, menu.model);
	},

	setup_widgets: function() {
		this.growler = this.controller.get('growler');
		this.list = this.controller.get('list');

		this.controller.setupWidget(this.growler.id, {});
		this.controller.setupWidget(this.list.id, {
				itemTemplate: 'list/list-item',
				listTemplate: 'list/list',
				uniquenessProperty: 'id',
				swipeToDelete: true,
				autoconfirmDelete: true,
				renderLimit: 80,
				reorderable: true
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
		this.controller.listen(this.list.id, Mojo.Event.listReorder,
			this.list.reorder_handler = this.on_order_clock.bind(this));
	},

	on_growler_tapped: function() {
		this.growler.mojo.dismiss();
	},

	on_clock_tapped: function(event) {
		var clock = event.item;
		Mojo.Controller.stageController.pushScene({ name: 'spotlight', disableSceneScroller: true }, clock.id);
	},

	on_remove_clock: function(event) {
		var clock = event.item;
		this.fire(Whendle.Gallery.Events.removing, { 'id': clock.id });
	},

	on_order_clock: function(event) {
		var clock = event.item;
		var new_index = event.toIndex;

		var identifiers = this.model.items
			.map(function(clock) { return clock.id; })
			.without(clock.id);
		identifiers.splice(new_index, 0, clock.id);
		this.fire(Whendle.Gallery.Events.ordering, { 'ids': identifiers });
	},

	loaded: function(event) {
		this.is_loaded = true;
		if (this.report_error(event.error)) return;

		var items = this.model.items = [];
		event.clocks.each(function(c) { items.push(c); });

		this.controller.modelChanged(this.model, this);
	},

	added: function(event) {
		if (this.report_error(event.error)) return;

		this.model.items.push(event.clocks[0]);
		this.controller.modelChanged(this.model, this);
		this.growler.mojo.dismiss();
	},

	removed: function(event) {
		if (this.report_error(event.error)) return;
		removed_id = event.clocks[0].id;

		clock = this.model.items.find(function(c) {
			return c.id == removed_id;
		});

		if (clock) {
			this.model.items = this.model.items.without(clock);
			this.controller.modelChanged(this.model, this);
		}
	},

	ordered: function(event) {
		if (this.report_error(event.error)) return;

		var ordered_items = [];
		var current_items = this.model.items;
		event.clocks.each(function(id) {
			var clock = current_items.find(function(c) {
				return c.id == id;
			});
			if (clock) ordered_items.push(clock);
		});

		this.model.items = ordered_items;
		this.controller.modelChanged(this.model, this);
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
				match.title = clock.title;
				match.subtitle = clock.subtitle;
				match.display = clock.display;
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

	activate: function(place) {
		this.controller.setMenuVisible(Mojo.Menu.commandMenu, true);

		if (place && place.name) {
			var message = $.string('gallery_adding_location').interpolate(place);
			this.growler.mojo.spin(message.escapeHTML());
			// assuming we have come from the finder
			// after the user has found a location...
			this.fire(Whendle.Gallery.Events.adding, { 'place': place });
		}
		else if (this.is_loaded) {
			// reload
			this.fire(Whendle.Gallery.Events.loading);
		}
	},

	deactivate: function(event) {
	},

	cleanup: function(event) {
		this.detach_events();
		this.presenter.destroy();
	},

	detach_events: function() {
		this.controller.stopListening(this.growler, Mojo.Event.tap, this.growler.tap_handler);
		this.controller.stopListening(this.list, Mojo.Event.listDelete, this.list.delete_handler);
		this.controller.stopListening(this.list, Mojo.Event.listTap, this.list.tap_handler);
		this.controller.stopListening(this.list, Mojo.Event.listReorder, this.list.reorder_handler);
	}
});