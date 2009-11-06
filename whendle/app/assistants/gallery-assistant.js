
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
		this.start_clocks();
	},

	added: function(clock, error) {
		var current = this.model.items.pop();
		if (this.report_error(error)) {
			clock = current;
			clock.adding = false;
		}
		
		this.model.items.push(clock);
		this.controller.modelChanged(this.model, this);
		this.update_clocks();
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
			this.update_clocks();
		}
	},
	
	updated: function(clock, error) {
		this.update_clocks();
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
		
		if (this.timer == -1) {
			this.start_clocks();
		}
	},
	
	new_clock: function(location) {
		var clock = new Whendle.Clock.from_location(location);
		clock.adding = true;
		this.model.items.push(clock);
		this.controller.modelChanged(this.model, this);
		
		this.fire(Whendle.Events.adding, { 'location': location });
	},

	start_clocks: function() {
		this.update_clocks();

		var now = Date.current();
		this.start_timer.bind(this)
			.delay(60 - now.getSeconds());
	},
	
	start_timer: function() {
		this.update_clocks();
		this.timer = new PeriodicalExecuter(
			this.update_clocks.bind(this), 60, this.controller.window);
	},
	
	update_clocks: function() {
		var now = Date.current();
		
		var length = this.list.mojo.getLength();
		for (var i = 0; i < length; i++) {
			var row = this.list.mojo.getNodeByIndex(i);
			var clock = this.list.mojo.getItemByNode(row);
			
			var when = now.copy();
			when.addMinutes(when.getTimezoneOffset());
			when.addMinutes(clock.offset);
			
			row.down('div.gallery-row-time').innerHTML = this.format_time(when);
			row.down('div.gallery-row-day').innerHTML = this.format_day(when);
		}
	},
	
	format_time: function(t) {
		var hours = t.getHours().toString();
		var minutes = t.getMinutes().toPaddedString(2);
		var ampm = t.getHours() < 12 ? 'am' : 'pm'; 
		return hours + ':' + minutes + ' ' + ampm;
	},
	
	format_day: function(d) {
		var today = Date.today();
		var day = d.copy();
		day.setMilliseconds(0);
		day.setSeconds(0);
		day.setMinutes(0);
		day.setHours(0);
		return day < today ? 'Yesterday' : day > today ? 'Tomorrow' : 'Today';
	},
	
	deactivate: function(event) {
		this.stop_clocks();
	},
	
	stop_clocks: function() {
		if (this.timer && this.timer != -1) {
			this.timer.stop();
			this.timer = -1;
		}
	},
	
	cleanup: function(event) {
		this.detach_events();
	},
	
	detach_events: function() {
		this.controller.stopListening(this.list, Mojo.Event.listAdd, this.list.add_handler);
		this.controller.stopListening(this.list, Mojo.Event.listDelete, this.list.delete_handler);
	}
});