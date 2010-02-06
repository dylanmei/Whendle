
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
		this.fire(Whendle.Event.loading, { id: this.id });
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
					{ label: $L('menu_map'), command: 'maps', iconPath: 'resources/menu-icon-maps.png' },
					{ label: $L('menu_edit'), command:'save' }
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

	slide_first: function(clock) {
		if (this.slides.length == 0) return;

		this.slides.each(function(s) {
			s.setup(clock);
		});

		this.invoke_slide(this.slides.first());
	},

	slide_next: function() {
		this.timer.stop();

		var slide = this.next_slide();
		if (slide) {
			this.invoke_slide(slide);
		}
		else {
			this.clear_tray();
			this.clear_backdrop();
		}
	},

	invoke_slide: function(slide) {
		slide.invoke(this.on_slide_ready.bind(this));
		this.slide = slide;
	},

	next_slide: function() {
		var slide = null;
		var index = this.slides.indexOf(this.slide);
		for (var i = index + 1; i < this.slides.length; i++) {
			if (this.slides[i].in_error_state()) continue;
			slide = this.slides[i];
		}

		if (slide == null) {
			for (var i = 0; i <= index; i++) {
				if (this.slides[i].in_error_state()) continue;
				slide = this.slides[i];
			}
		}

		return slide;
	},

	on_slide_ready: function(info, backdrop) {
		this.clear_tray();
		this.clear_backdrop();

		var tray = this.carousel.down('.tray');
		tray.insert(info);

		if (backdrop) {
			this.show_backdrop(backdrop);
		}

		this.timer = new PeriodicalExecuter(
			this.slide_next.bind(this), this.SLIDE_FREQUENCY);
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

		this.set_clock_values(clock);

		if (this.is_reloading) return;

		this.woeid = clock.woeid;
		this.longitude = clock.longitude;
		this.latitude = clock.latitude;

		this.maplet.mojo.draw(clock.longitude, clock.latitude,
			now.declination, now.hour_angle);

		this.controller.setMenuVisible(Mojo.Menu.commandMenu, true);

		this.model = {
			id: clock.id,
			name: clock.name,
			admin: clock.admin,
			country: clock.country
		};


		this.is_loaded = true;
		this.slide_first(clock);
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
			assistant: new SpotlightDialogAssistant(this),
			label1: $.string('spotlight_dialog_label_name'),
			label2: $.string('spotlight_dialog_label_admin'),
			label3: $.string('spotlight_dialog_label_country')
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

	activate: function() {
		if (this.is_loaded) {
			// reload
			this.is_reloading = true;
			this.fire(Whendle.Event.loading, { id: this.id });
		}
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
