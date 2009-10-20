
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
		this.setup_events();
	
		this.fire(Whendle.Events.load_ready, {});
	},
	
	setup_widgets: function() {
		this.controller.setupWidget('list', {
				itemTemplate: 'gallery/list-item',
				listTemplate: 'gallery/list',
				addItemLabel: $L('gallery_find_location'), 
				swipeToDelete: true,
				renderLimit: 40,
				reorderable: false
			},
			this.model
		);
		this.controller.setupWidget("spinner", { property: "saving" });
	},
	
	setup_events: function() {
		this.controller.listen('list', Mojo.Event.listAdd, this.on_find_tapped.bind(this));
	},
	
	loaded: function(clocks, error) {
		if (this.report_error(error)) return;
		
		this.model.items = clocks;
		this.controller.modelChanged(this.model, this);
	},
	
	report_error: function(error) {
		if (!error) return false;
		Mojo.Log.info('error ' + error.message);
		return true;
	},
	
	on_find_tapped: function() {
		this.stageController.pushScene({ name: 'finder' });
	},
	
	activate: function(location) {
		if (location && location.name) {
			this.new_clock(location);
		}
			
		Mojo.Log.info('activating clocks scene...');
	},
	
	new_clock: function(location) {
		var clock = new Whendle.Clock(location);
		clock.saving = true;
		this.model.items.push(clock);
		this.controller.modelChanged(this.model, this);
		
		this.fire(Whendle.Events.add, { 'location': location });
	},
	
	added: function(clock, error) {
		var current = this.model.items.pop();
		if (this.report_error(error)) {
			clock = current;
			clock.saving = false;
		}
		
		this.model.items.push(clock);
		this.controller.modelChanged(this.model, this);
	},
	
	deactivate: function(event) {
		Mojo.Log.info('deactivating clocks scene...');
	},
	
	cleanup: function(event) {
		Mojo.Log.info('cleaning up clocks scene...');
	}
});