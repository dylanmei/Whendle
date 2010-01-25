
SpotlightAssistant = Class.create(Whendle.Spotlight.View, {
	initialize: function($super, id) {
		$super();
		this.presenter = new Whendle.Spotlight.Presenter(this);
		this.id = id;
	},
	
	setup: function() {
		this.setup_model();
		this.setup_widgets();
		this.fire(Whendle.Event.loading, { id: this.id });
	},
	
	setup_model: function() {
	},
	
	setup_widgets: function() {
		viewport = Mojo.View.getViewportDimensions(this.controller.document);

		this.tyler = this.controller.get('spotlight-tyler');
		this.controller.setupWidget(this.tyler.id, {
			width: viewport.width,
			height: viewport.height - 72
		});
		this.controller.listen(this.tyler, 'tyler:ready',
			this.tyler.ready_handler = this.on_tyler_ready.bind(this));
	},
	
	on_tyler_ready: function() {
		$.trace('tyler ready');
	},
	
	write_header: function(clock) {
		$('spotlight-title').innerHTML = clock.title;
		$('spotlight-subtitle').innerHTML = clock.subtitle;
		$('spotlight-time').innerHTML = clock.display;
		$('spotlight-day').innerHTML = clock.day;
	},
	
	notify: function(event) {
		$.trace('notify called');
	},
	
	loaded: function(event) {
		var clock = event.clock;
		this.write_header(clock);
		this.tyler.mojo.go(clock.longitude, clock.latitude);
	},
	
	changed: function(event) {
		this.write_header(event.clock);
	},
	
	cleanup: function(event) {
		this.presenter.destroy();
	},
	
	detach_events: function() {
	}	
});