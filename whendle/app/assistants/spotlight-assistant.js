
SpotlightAssistant = Class.create(Whendle.Spotlight.View, {
	SLIDE_FREQUENCY: 10,

	initialize: function($super, id) {
		$super();
		this.presenter = new Whendle.Spotlight.Presenter(this);
		this.id = id;
	},

	extent: function() {
		var viewport = Mojo.View.getViewportDimensions(this.controller.document);
		var header = this.controller.get('spotlight-header');
		return viewport.width < viewport.height ? {
				x: viewport.width,
				y: viewport.height - header.getHeight()
			} : {
				x: viewport.height,
				y: viewport.width - header.getHeight()
			};
	},

	setup: function() {
		this.setup_orientation();
		this.setup_menus();
		this.setup_widgets();
		this.fire(Whendle.Spotlight.Events.loading, { id: this.id });
	},

	setup_orientation: function() {
		var stage_controller = this.controller.stageController;
		if (stage_controller.getWindowOrientation() != 'up')
			stage_controller.setWindowOrientation('up');
	},

	setup_menus: function() {
		var menu = {
			attributes: { menuClass: 'no-fade' },
			model: {
				visible: false,
				items: [
					{},
					{ label: $L('Map'), command: 'maps', iconPath: 'resources/menu-icon-maps.png' },
					{ label: $L('Edit'), command:'save' }
				]
			}
		}
		this.controller.setupWidget(Mojo.Menu.commandMenu, menu.attributes , menu.model);
	},

	setup_widgets: function() {
		this.setup_maplet();
		this.setup_carousel();
		this.setup_slides();
	},

	setup_maplet: function() {
		var extent = this.extent();

		this.maplet = this.controller.get('spotlight-maplet');
		this.controller.setupWidget(this.maplet.id, {
			width: extent.x,
			height: extent.y
		});
	},

	setup_carousel: function() {
		this.carousel = this.controller.get('spotlight-carousel');
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

	slide_next: function() {
		this.stop_slide_timer();

		var slide = this.next_slide();
		if (slide) {
			this.invoke_slide(slide);
		}
		else {
			this.clear_carousel();
		}
	},

	invoke_slide: function(slide) {
		if (slide) {
			slide.invoke(this.on_slide_ready.bind(this, slide));
		}
	},

	next_slide: function() {
		var index = this.slides.indexOf(this.slide || {});
		var slide = this.slides.find(function(s, i) {
			return i > index && this.can_show_slide(s);
		}, this);

		if (slide == null) {
			slide = this.slides.find(function(s) {
				return this.can_show_slide(s);
			}, this);
		}

		return slide;
	},

	can_show_slide: function(slide) {
		if (!slide) return false;
		if (slide.in_error_state()) return false;

		var profile = Whendle.profile();
		var default_value = false;
		var setting = false;

		switch (slide.name) {
			case 'weather':
				default_value = Whendle.show_weather_default;
				setting = profile.get('show_weather_slides');
				break;
			case 'photos':
				default_value = Whendle.show_photos_default;
				setting = profile.get('show_photo_slides');
				break;
		}

		return Object.isUndefined(setting) ?
			default_value : setting;
	},

	on_slide_ready: function(slide, info, backdrop) {
		if (!this.controller) return;

		this.clear_carousel();
		var tray = this.carousel.down('.tray');
		tray.insert(info);

		if (backdrop) {
			this.show_backdrop(backdrop);
		}

		this.slide = slide;
		this.start_slide_timer();
	},

	start_slide_timer: function() {
		this.timer = new PeriodicalExecuter(
			this.slide_next.bind(this), this.SLIDE_FREQUENCY);
	},

	stop_slide_timer: function() {
		if (this.timer) this.timer.stop();
		delete this.timer;
	},

	show_backdrop: function(backdrop) {

		var header = this.controller.get('spotlight-header');
		var viewport = {
			t: header.getHeight(),
			l: 0,
			r: this.extent().x,
			b: header.getHeight() + this.extent().y
		};

		var w = backdrop.getWidth() || viewport.r - viewport.l;
		var h = backdrop.getHeight() || viewport.b - viewport.t;

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

		if (!backdrop.hasClassName('backdrop'))
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

	clear_carousel: function() {
		this.clear_tray();
		this.clear_backdrop();
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
		var now = event.now;
		var clock = event.clock;

		this.load_model(clock);
		this.maplet.mojo.mark(clock.name,
			{ x: clock.longitude, y: clock.latitude });
		this.maplet.mojo.draw(now.declination, now.hour_angle);

		if (!this.is_loaded) {
			this.controller.setMenuVisible(Mojo.Menu.commandMenu, true);
		}

		this.load_slides(clock);
		this.is_loaded = true;
	},

	load_slides: function(clock) {
		this.slides.each(function(s) {
			s.setup(clock);
		});

		//this.invoke_slide(this.next_slide());
		this.slide_next();
	},

	load_model: function(clock) {
		this.set_clock_values(clock);

		this.woeid = clock.woeid;
		this.longitude = clock.longitude;
		this.latitude = clock.latitude;
		this.model = {
			id: clock.id,
			name: clock.name,
			admin: clock.admin,
			country: clock.country
		};
	},

	changed: function(event) {
		var now = event.now;
		var clock = event.clock;

		this.set_clock_values(clock);
		this.maplet.mojo.draw(now.declination, now.hour_angle);
	},

	saved: function(event) {
		var clock = event.clock;
		this.set_clock_values(clock);
		this.maplet.mojo.mark(clock.name);
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
			assistant: new SpotlightDialogAssistant(this),
			label1: $L('Name'),
			label2: $L('Region'),
			label3: $L('Country')
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
		this.fire(Whendle.Spotlight.Events.editing,	this.model);
	},

	cleanup: function(event) {
		if (this.timer) this.timer.stop();
		this.presenter.destroy();
	},

	activate: function() {
		if (this.is_loaded) {
			this.fire(Whendle.Spotlight.Events.loading, { id: this.id });
		}
	},

	deactivate: function() {
		this.stop_slide_timer();
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
