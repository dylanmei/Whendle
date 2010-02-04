// This file belongs to Whendle, a clock application for the Palm Pre
// http://github.com/dylanmei/Whendle

//
// Copyright (C) 2009-2010 Dylan Meissner (dylanmei@gmail.com)
//
// Permission is hereby granted, free of charge, to any person otaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
// 
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

Whendle.Startup = {
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
		
		view.observe(':starting',
			this.on_starting.bind(this, view));
	},

	on_starting: function(view, event) {
		var self = this;
		var timer = (event || {}).timer;

		this.startup.observe(
			':status',
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
					$.string('splash_message_installing') :
					$.string('splash_message_updating');
				var status = needs_install ?
					Whendle.Status.installing :
					Whendle.Status.updating;

				this.notify_status(view, status, feedback);
			}
		}
	},
	
	on_startup_ready: function(view) {
		view.started({
			'scene': this.profile.get('gallery') || 'list'
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