
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
		this.model = {
			'drawers': {
				'weather': false,
				'maps': false,
				'pictures': false,
				'twitter': false
			},
			'spinners': {
				'weather': false,
				'maps': false,
				'pictures': false,
				'twitter': false
			}
		};
	},
	
	setup_widgets: function() {
		this.setup_drawer('weather');
		this.setup_drawer('maps');
		this.setup_drawer('pictures');
		this.setup_drawer('twitter');
	},
	
	write_header: function(clock) {
		$('spotlight-title').innerHTML = clock.title;
		$('spotlight-subtitle').innerHTML = clock.subtitle;
		$('spotlight-time').innerHTML = clock.display;
		$('spotlight-day').innerHTML = clock.day;
	},
	
	setup_drawer: function(drawer_key) {
		var drawer = this.controller.get(drawer_key + '-drawer');
		this.controller.setupWidget(drawer.getAttribute('id'),
			{ 'property': drawer_key }, this.model.drawers);
		var button = drawer.previous('div.drawer-button');
		this.controller.listen(button,
			Mojo.Event.tap, this.on_drawer_tapped.bindAsEventListener(this));

		var spinner = this.controller.get(drawer_key + '-spinner');
		this.controller.setupWidget(spinner.getAttribute('id'),
			{ 'spinnerSize': 'small', property: drawer_key }, this.model.spinners);
	},
	
	on_drawer_tapped: function(event) {
		var button = event.findElement('div.drawer-button');
		var drawer = button.next('div.drawer');

		var which = drawer.getAttribute('id');
		for (var p in this.model.drawers) {
			var open = false;
			var target = which.startsWith(p);
			if (target) open = !this.model.drawers[p];
			this.model.drawers[p] = open;
		}
		this.controller.modelChanged(this.model.drawers, this);
	},
	
	notify: function(event) {
		$.trace('notify called');
	},
	
	loaded: function(event) {
		this.write_header(event.clock);
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