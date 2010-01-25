
SpotlightAssistant = Class.create(Whendle.Spotlight.View, {
	initialize: function($super, id) {
		$super();
		this.presenter = new Whendle.Spotlight.Presenter(this);
		this.id = id;
	},
	
	menu: {
		visible: false,
		items: [{}, {
			label: $L('Menu'),
			submenu: 'submenu'
		}]
	},
	
	submenu: {
		template: 'spotlight/submenu',
		items: [
			{ label: $L('Maps'), command: 'maps', iconPath: 'resources/spotlight-maps-icon.png' }, 
			{ label: $L('Weather'), command: 'weather', iconPath: 'resources/spotlight-weather-icon.png', disabled: true }, 
			{ label: $L('Edit'), command:'save', disabled: true }
	]},
	
	setup: function() {
		this.setup_widgets();
		this.fire(Whendle.Event.loading, { id: this.id });
	},
	
	setup_widgets: function() {
		this.controller.setupWidget(Mojo.Menu.commandMenu, { menuClass: 'no-fade' }, this.menu);
		this.controller.setupWidget('submenu', {}, this.submenu);

		var viewport = Mojo.View.getViewportDimensions(this.controller.document);

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

		this.woeid = clock.woeid;
		this.longitude = clock.longitude;
		this.latitude = clock.latitude;

		this.tyler.mojo.go(clock.longitude, clock.latitude);
		this.controller.setMenuVisible(Mojo.Menu.commandMenu, true);
	},
	
	changed: function(event) {
		this.write_header(event.clock);
	},
	
	handleCommand: function(event) {
		if (event.command == 'save') {
			event.stop();
		}
		else if (event.command == 'weather') {
			event.stop();
		}
		else if (event.command == 'maps') {
			event.stop();
			this.launch_maps();
		}
	},
	
	launch_maps: function() {
		this.controller.serviceRequest('palm://com.palm.applicationManager', {
			method: 'open',
			parameters: {
				id: 'com.palm.app.maps',
				params: {
					query: this.latitude + ',' + this.longitude,
					zoom: 10
				}
			}
		});
	},
	
	cleanup: function(event) {
		this.presenter.destroy();
	},
	
	detach_events: function() {
	}	
});