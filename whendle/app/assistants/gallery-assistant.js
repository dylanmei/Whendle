
GalleryAssistant = Class.create(Whendle.Gallery.View, {
	initialize: function($super) {
		$super();
		this.appController = Mojo.Controller.getAppController();
		this.stageController = this.appController.getStageController(Whendle.stage_name);
		
		this._presenter = new Whendle.Gallery.Presenter(this);
	},
	
	setup: function() {
		this.model = {
			'items': []
		};
		this.setup_widgets();
		this.attach_events();
		this.fire(Whendle.Events.loading, { 'timer': new Whendle.Timer(this.controller.window) });
	},
	
	setup_widgets: function() {
		this.list = this.controller.get('list');
		this.controller.setupWidget('list', {
				itemTemplate: 'gallery/list-item',
				listTemplate: 'gallery/list',
				addItemLabel: $.string('gallery_find_location'), 
				uniquenessProperty: 'id',
				swipeToDelete: true,
				autoconfirmDelete: true,
				renderLimit: 80,
				reorderable: false
			},
			this.model
		);
		this.controller.setupWidget('spinner', { property: 'adding' });
	},
	
	attach_events: function() {
		this.controller.listen('list', Mojo.Event.listAdd,
			this.list.add_handler = this.on_find_tapped.bind(this));
		this.controller.listen('list', Mojo.Event.listDelete,
			this.list.delete_handler = this.on_remove_clock.bind(this));
	},
	
	on_find_tapped: function() {
		this.stageController.pushScene({ name: 'finder' });
	},
	
	on_remove_clock: function(event) {
		var clock = event.item;
		this.fire(Whendle.Events.removing, { 'id': clock.id });
	},
	
	loaded: function(event) {
		if (this.report_error(event.error)) return;

		this.model.items = event.clocks;
		this.controller.modelChanged(this.model, this);
	},

	added: function(event) {
		if (this.report_error(event.error)) return;
		
		this.model.items.push(event.clocks[0]);
		this.controller.modelChanged(this.model, this);
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
			// assuming we have come from the finder
			// after the user has found a location...
			this.fire(Whendle.Events.adding, { 'location': location });
		}
	},
	
	deactivate: function(event) {
	},
	
	cleanup: function(event) {
		this.detach_events();
	},
	
	detach_events: function() {
		this.controller.stopListening(this.list, Mojo.Event.listAdd, this.list.add_handler);
		this.controller.stopListening(this.list, Mojo.Event.listDelete, this.list.delete_handler);
	}
});