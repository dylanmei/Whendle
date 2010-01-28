
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

		this.start_sliding(clock);
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
		var index = Math.floor(Math.random() * this.slides.length);
		var slide = this.slides[index];
		slide.invoke(this.on_next_slide.bind(this));
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

	changed: function(event) {
		this.write_header(event.clock);
	},
	
	handleCommand: function(event) {
		if (event.command == 'save') {
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
		if (this.timer) this.timer.stop();
		this.presenter.destroy();
	},
	
	detach_events: function() {
	}	
});