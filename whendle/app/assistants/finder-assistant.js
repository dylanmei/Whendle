
FinderAssistant = Class.create(Whendle.Finder.View, {
	initialize: function($super) {
		$super();
		this.appController = Mojo.Controller.getAppController();
		this.stageController = this.appController.getStageController(Whendle.stage_name);

		this._presenter = new Whendle.Finder.Presenter(this);
	},
	
	setup: function() {
		this.model = {
			'text': '',
			'items': []
		};

		this.setup_widgets();
		this.attach_events();
	},
	
	setup_widgets: function() {
		this.text = this.controller.get('text');
		this.list = this.controller.get('list');
		this.status = this.controller.get('status');
		
		this.controller.setupWidget(this.text.id, {});
		this.controller.setupWidget(this.status.id, {});
		this.controller.setupWidget(this.list.id, {
				itemTemplate: 'finder/list-item',
				listTemplate: 'finder/list',
				swipeToDelete: false,
				renderLimit: 100,
				reorderable: false
			},
			this.model
		);
	},
	
	attach_events: function() {
		this.text.change_handler = this.on_input_changed.bind(this);
		this.controller.listen(this.text, Mojo.Event.filter, this.text.change_handler);
		
		this.status.tap_handler = this.on_status_tap.bind(this);
		this.controller.listen(this.status, Mojo.Event.tap, this.status.tap_handler);
		
		this.list.tap_handler = this.on_list_tap.bind(this);
		this.controller.listen(this.list, Mojo.Event.listTap, this.list.tap_handler);
	},

	on_input_changed: function(event) {
		var value = (event.filterString || '').strip();

		if (value.length == 0) {
			this.empty();
		}
		else {
			this.search(value);
		}
	},
	
	on_list_tap: function(event) {
		var index = event.index;
		Mojo.Log.info('(Finder)', 'list tapped at', index);
		if (index < this.count()) {
			var location = this.model.items[index];
			this.stageController.popScene(location, {});
		}
	},
	
	on_status_tap: function(event) {
		var index = this.count();
		var text = this.model.text;
		this.search(text, index);
	},
	
	count: function() {
		return this.model.items.length;
	},
	
	empty: function() {
		this.model.text = '';
		this.loaded([], 0, 0);
	},

	search: function(text, index) {
		index = index || 0;
		this.model.text = text;
	
		Mojo.Log.info('fetching locations for: #{text} (index=#{index})'
			.interpolate({ 'text': text, 'index': index }));
		
		this.status.mojo.spin($.string('finder_search_status')
			.interpolate({ 'text': text }));
		this.fire(Whendle.Events.searching, { 'start': index, 'query': text });
	},

	loaded: function(places, index, total, error) {
		if (index == 0) {
			this.model.items = places;
			this.controller.modelChanged(this.model, this);
		}
		else {
			this.model.items = this.model.items.concat(places);
			this.list.mojo.noticeAddedItems(index, places);
		}
		
		this.update_status(this.count(), total);
	},
	
	update_status: function(count, total) {
		var remaining = total - count;
		var message = (remaining <= 0)
			? ''
			: $.string('finder_more_results').interpolate({ 'count': remaining });
		this.status.mojo.stop(message);
	},
	
	cleanup: function(event) {
		this.detach_events();
	},
	
	detach_events: function() {
		this.controller.stopListening(this.text, Mojo.Event.filter, this.text.change_handler);
		this.controller.stopListening(this.list, Mojo.Event.listTap, this.list.tap_handler);
		this.controller.stopListening(this.status, Mojo.Event.tap, this.status.tap_handler);
	}
});
