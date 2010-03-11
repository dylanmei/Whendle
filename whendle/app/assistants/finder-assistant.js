
FinderAssistant = Class.create(Whendle.Finder.View, {
	initialize: function($super) {
		$super();
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
		if (index < this.count()) {
			var place = this.model.items[index].place;
			Mojo.Controller.stageController.popScene(place, {});
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
		this.found({ results: [], index: 0, total: 0 });
	},

	search: function(text, index) {
		index = index || 0;
		this.model.text = text;

		this.status.mojo.spin($.string('finder_search_status')
			.interpolate({ 'text': text }));
		this.fire(Whendle.Finder.Events.searching, { 'start': index, 'query': text });
	},

	found: function(event) {
		if (event.index == 0) {
			this.model.items = event.results;
			this.controller.modelChanged(this.model, this);
		}
		else {
			this.model.items = this.model.items.concat(event.results);
			this.list.mojo.noticeAddedItems(event.index, event.results);
		}

		this.update_status(this.count(), event.total);
	},

	update_status: function(count, total) {
		var remaining = total - count;
		var message = (remaining <= 0)
			? total == 0 ? $.string('finder_no_results') : ''
			: $.string('finder_more_results').interpolate({ 'count': remaining });
		this.status.mojo.stop(message);
	},

	activate: function() {
		this.status.mojo.stop($.string('finder_type_to_find_a_location'));
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
