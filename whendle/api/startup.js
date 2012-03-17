
Whendle.Startup = {
	Events: { starting: ':staring' }
};

Whendle.Startup.View = Class.create(Whendle.Observable, {
	initialize: function($super) {
		$super();
	},

	//	event = {
	//		status: #,
	//		text: ''
	//	}
	notify: function(event) {
	},

	// 	event = {
	//		scene: ''
	//	}
	started: function(event) {
	}
});

Whendle.Startup.Presenter = Class.create({

	initialize: function(view, startup, profile) {
		this.startup = startup || Whendle.startup();
		this.profile = profile || Whendle.profile();

		view.observe(
			Whendle.Startup.Events.starting,
			this.on_starting.bind(this, view));
	},

	on_starting: function(view, event) {
		var self = this;
		var timer = (event || {}).timer;

		this.startup.observe(
			Whendle.Startup.Events.status,
			this.on_startup_status.bind(this, view)
		);
		this.startup.run(timer);
	},

	on_startup_status: function(view, event) {
		if (event.ready) {
			this.on_startup_ready(view);
		}
		else {
			var needs_install = event.installing;
			var needs_upgrade = event.upgrading;

			if (needs_install || needs_upgrade) {
				var feedback = needs_install ?
					$L('Starting up for the first time...') :
					$L('Updating a few things...');
				var status = needs_install ?
					Whendle.Status.installing :
					Whendle.Status.updating;

				this.notify_status(view, status, feedback);
			}
		}
	},

	on_startup_ready: function(view) {
		view.started({
			'scene': this.profile.get('gallery', 'list')
		});
	},

	notify_status: function(view, status, text) {
		if (view && view.notify) {
			view.notify({
				'status': status,
				'text': text
			});
		}
	}
});