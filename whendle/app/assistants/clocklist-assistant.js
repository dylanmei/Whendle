
ClocklistAssistant = Class.create(Whendle.Clocklist.View, {
	initialize: function($super) {
		$super();
		this.appController = Mojo.Controller.getAppController();
		this.stageController = this.appController.getStageController(Whendle.stage_name);
		
		this._presenter = new Whendle.Clocklist.Presenter(this);
	},
	
	setup: function() {
		this.model = { 'items': [] };
		this.setup_widgets();
		this.setup_events();
	
		this.fire(Whendle.Events.load_ready, {});
	},
	
	setup_widgets: function() {
		this.controller.setupWidget('list', {
				itemTemplate: 'clocklist/list-item',
				listTemplate: 'clocklist/list',
				addItemLabel: $L('clocklist_find_location'), 
				swipeToDelete: true,
				renderLimit: 40,
				reorderable: false
			},
			this.model
		);			
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
//		Whendle.Finder.push_scene(this);
//		Mojo.Log.info('find tapped...');
	},
	
	activate: function(event) {
		Mojo.Log.info('activating clocks scene...');
	},
	
	deactivate: function(event) {
		Mojo.Log.info('deactivating clocks scene...');
	},
	
	cleanup: function(event) {
		Mojo.Log.info('cleaning up clocks scene...');
	}
});