
SpotlightAssistant = Class.create(Whendle.Spotlight.View, {
	SLIDE_FREQUENCY: 10,
	
	initialize: function($super, id) {
		$super();
		this.presenter = new Whendle.Spotlight.Presenter(this);
		this.id = id;
	},
	
	menu: {
		visible: false,
		items: [
			{},
			{ label: $L('Maps'), command: 'maps', iconPath: 'resources/menu-icon-maps.png' },
			{ label: $L('Edit'), command:'save' }
		]
	},

	extent: function() {
		var viewport = Mojo.View.getViewportDimensions(this.controller.document);
		return {
			x: viewport.width,
			y: viewport.height - 72
		}
	},
	
	setup: function() {
		this.setup_widgets();
		this.fire(Whendle.Event.loading, { id: this.id });
	},
	
	setup_widgets: function() {
		this.controller.setupWidget(Mojo.Menu.commandMenu, { menuClass: 'no-fade' }, this.menu);

		this.setup_tyler();
		this.setup_carousel();
		this.setup_slides();
		//this.setup_dialog();
	},
	
	setup_tyler: function() {
		var extent = this.extent();

		this.tyler = this.controller.get('spotlight-tyler');
		this.controller.setupWidget(this.tyler.id, {
			width: extent.x,
			height: extent.y
		});
		this.controller.listen(this.tyler, 'tyler:ready',
			this.tyler.ready_handler = this.on_tyler_ready.bind(this));
	},
	
	on_tyler_ready: function() {
	},

	setup_carousel: function() {
		var extent = this.extent();
		this.carousel = this.controller.get('spotlight-carousel');
		this.carousel.setStyle({
			width: extent.x + 'px',
			height: extent.y + 'px'
		});
		
		this.carousel.insert(new Element('div', { 'class': 'tray' }));
	},

	setup_slides: function() {
		this.slides = [];
		this.slides.push(new Weather_Slide());
		this.slides.push(new Photo_Slide());
	},
	
	set_clock_values: function(clock) {
		$('spotlight-title').innerHTML = clock.title.escapeHTML();
		$('spotlight-subtitle').innerHTML = clock.subtitle.escapeHTML();
		$('spotlight-time').innerHTML = clock.display;
		$('spotlight-day').innerHTML = clock.day;
	},
	
	start_sliding: function(clock) {
		if (this.slides.length == 0) return;

		this.slides.each(function(s) {
			s.setup(clock);
		});
		
		// do the first slide...
		var slide = this.slides[0];
		slide.invoke(this.on_first_slide.bind(this));
		
		// run the slides randomly
		this.timer = new PeriodicalExecuter(
			this.next_slide.bind(this), this.SLIDE_FREQUENCY);
	},
	
	next_slide: function() {
		var index = (this.slide_index || 0) + 1;
		if (index > this.slides.length - 1) index = 0;
		//var index = Math.floor(Math.random() * this.slides.length);
		
		var slide = this.slides[index];
		slide.invoke(this.on_next_slide.bind(this));
		this.slide_index = index;
	},
	
	on_first_slide: function(element, backdrop) {
		var tray = this.carousel.down('.tray');
		tray.insert(element);
		if (backdrop) {
			this.show_backdrop(backdrop);
		}
	},
	
	show_backdrop: function(backdrop) {
		var header = this.controller.get('spotlight-header');
		var viewport = {
			t: header.getHeight() - 1,
			l: 0,
			r: this.extent().x,
			b: header.getHeight() + this.extent().y
		};
		
		var w = backdrop.getWidth();
		var h = backdrop.getHeight();
		
		if (w < viewport.r - viewport.l) {
			var r = (viewport.r - viewport.l) / w;
			w = Math.round(w * r);
			h = Math.round(h * r);
		}
		
		if (h < viewport.b - viewport.t) {
			var r = (viewport.b - viewport.t) / h;
			w = Math.round(w * r);
			h = Math.round(h * r);
		}
		
		var x = viewport.l + ((viewport.r - viewport.l) / 2) - (w / 2);
		var y = viewport.t + ((viewport.b - viewport.t) / 2) - (h / 2);
		var clip = {
			t: -y + viewport.t,
			l: -x + viewport.l,
			b: h,
			r: w
		};
		
		backdrop.addClassName('backdrop');
		backdrop.setStyle({
			top: y + 'px',
			left: x + 'px',
			width: w + 'px',
			height: h + 'px',
			clip: 'rect(#{t}px #{r}px #{b}px #{l}px)'.interpolate(clip)
		});

		this.carousel.insert(backdrop);
	},
	
	on_next_slide: function(info, backdrop) {
		this.clear_tray();
		this.clear_backdrop();

		var tray = this.carousel.down('.tray');
		tray.insert(info);
		
		if (backdrop) {
			this.show_backdrop(backdrop);
		}
	},

	clear_backdrop: function() {
		var backdrop = this.carousel.down('.backdrop');
		if (backdrop) {
			backdrop
				.removeClassName('backdrop')
				.remove();
		}
	},
	
	clear_tray: function() {
		var tray = this.carousel.down('.tray');
		tray.childElements().each(function(c) {
			c.remove();
		});
	},

	notify: function(event) {
		$.trace('notify called');
	},

	loaded: function(event) {
		var clock = event.clock;
		this.set_clock_values(clock);

		this.woeid = clock.woeid;
		this.longitude = clock.longitude;
		this.latitude = clock.latitude;

		this.tyler.mojo.go(clock.longitude, clock.latitude);
		this.controller.setMenuVisible(Mojo.Menu.commandMenu, true);

		this.model = {
			id: clock.id,
			name: clock.name,
			admin: clock.admin,
			country: clock.country
		};

		this.start_sliding(clock);
	},

	changed: function(event) {
		this.set_clock_values(event.clock);
	},
	
	saved: function(event) {
		this.set_clock_values(event.clock);
	},
	
	handleCommand: function(event) {
		if (event.command == 'save') {
			event.stop();
			this.launch_dialog();
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
	
	launch_dialog: function() {
		this.setup_dialog();
		this.controller.showDialog({
			template: 'spotlight/spotlight-dialog',
			assistant: new SpotlightDialogAssistant(this)
		});		
	},

	setup_dialog: function() {
		var model = this.model || {};
		var attributes = {
			multiline: false,
			focusMode: Mojo.Widget.focusInsertMode,
			maxLength: 32
		}
		
		this.controller.setupWidget('spotlight-dialog-name',
			Object.extend({ modelProperty: 'name' }, attributes), model);

		this.controller.setupWidget('spotlight-dialog-admin',
			Object.extend({ modelProperty: 'admin' }, attributes), model);	

		this.controller.setupWidget('spotlight-dialog-country',
			Object.extend({ modelProperty: 'country' }, attributes), model);
	},
	
	save_dialog: function() {
		this.fire(':editing', this.model);
	},

	cleanup: function(event) {
		if (this.timer) this.timer.stop();
		this.presenter.destroy();
	},
	
	detach_events: function() {
	}	
});

SpotlightDialogAssistant = Class.create({
	initialize: function(scene_assistant) {
		this.scene_assistant = scene_assistant;
		this.controller = scene_assistant.controller;
	},
	
	setup: function(widget) {
		this.widget = widget;
		this.controller.get('spotlight-dialog-save').addEventListener(Mojo.Event.tap,
			this.on_save.bindAsEventListener(this));
		this.controller.get('spotlight-dialog-cancel').addEventListener(Mojo.Event.tap,
			this.on_cancel.bindAsEventListener(this));
	},
	
	on_save: function() {
		this.scene_assistant.save_dialog();
		this.widget.mojo.close();
	},
	
	on_cancel: function() {
		this.widget.mojo.close();
	}
});
