
GalleryAssistant = Class.create(Whendle.Gallery.View, {
	initialize: function($super) {
		$super();
		this.appController = Mojo.Controller.getAppController();
		this.stageController = this.appController.getStageController(Whendle.stage_name);
		
		this._presenter = new Whendle.Gallery.Presenter(this);
	},
	
	setup: function() {
		this.model = { 'items': [] };
		this.setup_widgets();
		this.attach_events();
	
		this.fire(Whendle.Events.loading, {});
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
		$.trace('about to remove...', clock.location);
		this.fire(Whendle.Events.removing, { 'clock': clock });
	},
	
	loaded: function(clocks, error) {
		if (this.report_error(error)) return;
		
		this.model.items = clocks;
		this.controller.modelChanged(this.model, this);
	},

	added: function(clock, error) {
		var current = this.model.items.pop();
		if (this.report_error(error)) {
			clock = current;
			clock.adding = false;
		}
		
		this.model.items.push(clock);
		this.controller.modelChanged(this.model, this);
	},
	
	removed: function(clock_id, error) {
		if (this.report_error(error)) return;
		
		// todo: need to clean the model?
		clock = this.model.items.find(function(c) {
			return c.id == clock_id;
		});
		
		if (clock) {
			this.model.items = this.model.items.without(clock);
			this.controller.modelChanged(this.model, this);
		}
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
			this.new_clock(location);
		}
	},
	
	new_clock: function(location) {
		var clock = new Whendle.Clock.from_location(location);
		clock.adding = true;
		this.model.items.push(clock);
		this.controller.modelChanged(this.model, this);
		
		this.fire(Whendle.Events.adding, { 'location': location });
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