
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
		this.appender = this.controller.get('appender');

		this.controller.setupWidget(this.text.id, {});
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
		Mojo.Log.info('Finder setup_events...');
		
		this.text.change_handler = this.on_input_changed.bind(this);
		this.controller.listen(this.text.id, Mojo.Event.filter, this.text.change_handler);
		
		this.appender.tap_handler = this.on_append.bind(this);
		this.controller.listen(this.appender.id, Mojo.Event.tap, this.appender.tap_handler);
		
		this.list_tap_handler = this.controller.listen('list',
			Mojo.Event.listTap, this.on_list_tap.bind(this));
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
	},
	
	on_append: function(event) {
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
		
		this.fire(Whendle.Events.search, { 'start': index, 'query': text });
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
		
		this.update_appender(this.count(), total);
	},
	
	update_appender: function(count, total) {
		var amount_remaining = total - count;
		if (amount_remaining <= 0) {
			this.appender.hide();
		}
		else {
			this.appender.show();
			this.appender.update($L('finder_more_results')
				.interpolate({ 'count': amount_remaining }));
		}
	},
	
	selected: function(clock, error) {
	},

	cleanup: function(event) {
		this.detach_events();
	},
	
	detach_events: function() {
		this.controller.stopListening(this.text.id, Mojo.Event.filter, this.text.change_handler);
	}
});