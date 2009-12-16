
GalleryAssistant = Class.create(Whendle.Gallery.View, {
	initialize: function($super) {
		$super();
		this._presenter = new Whendle.Gallery.Presenter(this);
	},
	
	setup: function() {
		this.model = {
			'items': []
		};
		this.setup_widgets();
		this.attach_events();
		
		this.fire(Whendle.Event.loading,
			{ 'timer': new Whendle.Timer(this.controller.window) });
	},
	
	setup_widgets: function() {
		this.splash = this.controller.get('splash');
		this.growler = this.controller.get('growler');
		this.list = this.controller.get('list');

		this.controller.setupWidget(this.growler.id, {});
		this.controller.setupWidget(this.splash.id, {});
		this.controller.setupWidget(this.list.id, {
				itemTemplate: 'gallery/list-item',
				listTemplate: 'gallery/list',
				addItemLabel: $.string('gallery_find_location'), 
				uniquenessProperty: 'id',
				swipeToDelete: true,
				autoconfirmDelete: true,
				renderLimit: 80,
				reorderable: false,
				dividerFunction: null
			},
			this.model
		);
	},
	
	attach_events: function() {
		this.controller.listen(this.growler.id, Mojo.Event.tap,
			this.growler.tap_handler = this.on_growler_tapped.bind(this));
		this.controller.listen(this.splash.id, Mojo.Event.tap,
			this.splash.tap_handler = this.on_splash_tapped.bind(this));
		this.controller.listen(this.list.id, Mojo.Event.listAdd,
			this.list.add_handler = this.on_find_tapped.bind(this));
		this.controller.listen(this.list.id, Mojo.Event.listDelete,
			this.list.delete_handler = this.on_remove_clock.bind(this));
	},
	
	on_growler_tapped: function() {
		this.growler.mojo.dismiss();
	},
	
	on_splash_tapped: function() {
		this.splash.mojo.dismiss();
	},
	
	on_find_tapped: function() {
		Mojo.Controller.stageController.pushScene({ name: 'finder' });
	},
	
	on_remove_clock: function(event) {
		var clock = event.item;
		this.fire(Whendle.Event.removing, { 'id': clock.id });
	},
	
	ready: function() {
		if (this.notice) {
			this.splash.mojo.message(this.notice.text);
		}
	},
	
	notify: function(event) {
		if (this.splash.visible()) {
			this.splash_notify(event);
		}
		else {
			// todo: growl
		}
	},
	
	splash_notify: function(event) {
		if (!this.notice || event.status == Whendle.Status.exception) {
			// only use the first notice unless there's an issue
			this.notice = Object.clone(event);
			if (this.splash.mojo) {
				this.splash.mojo.message(this.notice.text);
			}
		}
	},
	
	loaded: function(event) {
		if (this.report_error(event.error)) return;
		
		var show_splash = Whendle.show_splash ||
			this.notice.status == Whendle.Status.installing ||
			this.notice.status == Whendle.Status.updating;
			
		if (show_splash) {
			this.splash.mojo.interactive(true);
			if (this.notice.status == Whendle.Status.installing) {
				this.splash.mojo.message($.string('splash_message_install_continue'));
			}
			else if (this.notice.status == Whendle.Status.updating) {
				this.splash.mojo.message($.string('splash_message_update_continue'));
			}
			else {
				this.splash.mojo.message($.string('splash_message_continue'));
			}
		}
		else {
			this.splash.mojo.dismiss(true);
		}

		this.model.items = event.clocks;
		this.refresh_model();
	},
	
	added: function(event) {
		if (this.report_error(event.error)) return;
		
		this.model.items.push(event.clocks[0]);
		this.refresh_model();
		this.growler.mojo.dismiss();
	},
	
	removed: function(event) {
		if (this.report_error(event.error)) return;

		clock = this.model.items.find(function(c) {
			return c.id == event.clocks[0].id;
		});
		
		if (clock) {
			this.model.items = this.model.items.without(clock);
			this.refresh_model();
		}
	},
	
	changed: function(event) {
		if (this.report_error(event.error)) return;
		var clocks = event.clocks;
		var items = this.model.items;
		var changes = false;
		clocks.each(function(clock) {
			var match = items.find(function(item) {
				return item.id == clock.id;
			});
			if (match) {
				changes = true;
				match.time = clock.time;
				match.day = clock.day;
				match.format = clock.format;
			}
		});
		if (changes) {
			this.refresh_model();
		}
	},
	
	refresh_model: function() {
		this.controller.modelChanged(this.model, this);
		this.fixup_clocks(this.model.items);
	},
	
	fixup_clocks: function(clocks) {
		var self = this;
		var rows = this.list.select('.gallery-row');
		clocks.each(function(clock) {
			var match = rows.find(function(row) {
				return row.readAttribute('clock') == clock.id;
			});
			
			if (match) {
				var dh = match.down('.gallery-row-hour');
				var dm = match.down('.gallery-row-minute');
				self.fixup_flip_time_elements(dh, dm, clock.time, clock.format);
			}
		});
	},
	
	fixup_flip_time_elements: function(hours, minutes, time, format) {
		var p1 = this.fixup_get_flip_position(time.hour(), format);
		var p2 = this.fixup_get_flip_position(time.minute());
		
		hours.setStyle({
			'backgroundPosition': p1.x + 'px ' + p1.y + 'px'
		});
		minutes.setStyle({
			'backgroundPosition': p2.x + 'px ' + p2.y + 'px'
		});		
	},
	
	fixup_get_flip_position: function(n, format) {
		//$.trace(n, ':', 'x =', Math.floor(n / 10), 'y =', n % 10);
		var x = -2;
		var y = -2;
		var w = 64;
		var h = 64;
		var h24 = format != 12;
		
		y = y - (n * h);
		if (!h24) {
			y = y - 3840;
		}
		
		return { 'x': x, 'y': y };
	},
	
	report_error: function(error) {
		if (!error) return false;
		$.trace('error ' + error.message);
		return true;
	},
	
	activate: function(location) {
		if (location && location.name) {
			this.growler.mojo.spin('Adding ' + location.name + '...');
			// assuming we have come from the finder
			// after the user has found a location...
			this.fire(Whendle.Event.adding, { 'location': location });
		}
	},
	
	deactivate: function(event) {
	},
	
	cleanup: function(event) {
		this.detach_events();
	},
	
	detach_events: function() {
		this.controller.stopListening(this.growler, Mojo.Event.tap, this.growler.tap_handler);
		this.controller.stopListening(this.splash, Mojo.Event.tap, this.splash.tap_handler);
		this.controller.stopListening(this.list, Mojo.Event.listAdd, this.list.add_handler);
		this.controller.stopListening(this.list, Mojo.Event.listDelete, this.list.delete_handler);
	}
});