
SpotlightAssistant = Class.create(Whendle.Spotlight.View, {
	initialize: function($super, clock) {
		$super();
		this._presenter = new Whendle.Spotlight.Presenter(this);
		this.clock = clock;
	},
	
	id: function() {
		return this.clock.id;
	},
	
	setup: function() {
		this.setup_model();
		this.setup_widgets();
		this.fire(Whendle.Event.loading);
	},
	
	setup_model: function() {
//		this.model = {
//			'drawers': {
//				'maps': true,
//				'weather': false,
//				'flickr': false,
//				'twitter': false
//			},
//			'spinners': {
//				'maps': false,
//				'weather': false,
//				'flickr': false,
//				'twitter': false
//			}
//		};
	},
	
	setup_widgets: function() {
//		this.setup_drawer('maps');
//		this.setup_drawer('weather');
//		this.setup_drawer('flickr');
//		this.setup_drawer('twitter');
		this.writer_header();
	},
	
	writer_header: function() {
		$('spotlight-name').innerHTML = this.clock.name;
		$('spotlight-place').innerHTML = this.clock.place;
		$('spotlight-time').innerHTML = this.clock.time;
		$('spotlight-day').innerHTML = this.clock.day;
	},
	
//	setup_drawer: function(drawer_key) {
//		var drawer = this.controller.get(drawer_key + '-drawer');
//		this.controller.setupWidget(drawer.getAttribute('id'),
//			{ 'property': drawer_key }, this.model.drawers);

//		var button = drawer.previous('div.drawer-button');
//		this.controller.listen(button,
//			Mojo.Event.tap, this.on_drawer_tapped.bindAsEventListener(this));

//		var spinner = this.controller.get(drawer_key + '-spinner');
//		this.controller.setupWidget(spinner.getAttribute('id'),
//			{ 'spinnerSize': 'small', property: drawer_key }, this.model.spinners);
//	},
	
	on_drawer_tapped: function(event) {
//		var button = event.findElement('div.drawer-button');
//		var drawer = button.next('div.drawer');

//		var which = drawer.getAttribute('id');
//		for (var p in this.model.drawers) {
//			var open = false;
//			var target = which.startsWith(p);
//			if (target) open = !this.model.drawers[p];
//			this.model.drawers[p] = open;
//		}
//		this.controller.modelChanged(this.model.drawers, this);
	},
	
	notify: function(event) {
		$.trace('notify called');
	},
	
	clock_loaded: function(event) {
		$.trace('loaded called');
	},
	
	clock_changed: function(event) {
		this.clock = event.clock;
		this.writer_header();
	},
	
	cleanup: function(event) {
		this.fire(Whendle.Event.unloading);
	},
	
	detach_events: function() {
	}	
});