
StartupAssistant = Class.create(Whendle.Startup.View, {
	initialize: function($super) {
		$super();
		new Whendle.Startup.Presenter(this);
	},
	
	setup: function() {
		this.setup_widgets();
		this.attach_events();
		this.fire(':starting',
			{ 'timer': new Whendle.Timer(this.controller.window) });
	},
	
	setup_widgets: function() {
		this.splash = this.controller.get('splash');
		this.controller.setupWidget(this.splash.id);
	},
	
	attach_events: function() {
		this.controller.listen(this.splash.id, Mojo.Event.tap,
			this.splash.tap_handler = this.on_splash_tapped.bind(this));
	},

	started: function(event) {
		this.destination = event.scene;
		var status = this.notice ? this.notice.status : '';
		var show_splash = Whendle.show_splash ||
			status == Whendle.Status.installing ||
			status == Whendle.Status.updating;
		
		if (!show_splash) {
			this.exit_scene();
		}
		else {
			this.splash.mojo.interactive(true);
			if (status == Whendle.Status.installing) {
				this.splash.mojo.message($.string('splash_message_install_continue'));
			}
			else if (status == Whendle.Status.updating) {
				this.splash.mojo.message($.string('splash_message_update_continue'));
			}
			else {
				this.splash.mojo.message($.string('splash_message_continue'));
			}
		}
	},
	
	notify: function(event) {
		if (!this.notice || event.status == Whendle.Status.exception) {
			// only use the first notice unless there's an issue
			this.notice = Object.clone(event);
			if (this.splash.mojo) {
				this.splash.mojo.message(this.notice.text);
			}
		}
	},	
	
	on_splash_tapped: function() {
		if (this.destination) {
			this.exit_scene();
		}
	},
	
	exit_scene: function() {
		this.controller.stageController.swapScene({
			transition: Mojo.Transition.crossFade,
			name: this.destination
		});
	},
	
	cleanup: function(event) {
		this.detach_events();
	},
	
	detach_events: function() {
		this.controller.stopListening(this.splash, Mojo.Event.tap, this.splash.tap_handler);
	}
});