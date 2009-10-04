/*
Copyright (c) 2009, Dylan Meissner <dylanmei@gmail.com>

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
*/

function AppAssistant (appController) {
}

AppAssistant.prototype.setup = function() {
	this.settings = new Whendle.SettingsService();
};

//  -------------------------------------------------------
//  handleLaunch - called by the framework when the application is asked to launch
//    - First launch; create card stage and first first scene
//    - Update; after alarm fires to update feeds
//    - Notification; after user taps banner or dashboard
//
AppAssistant.prototype.handleLaunch = function (launch_params) {
	this.prepare_settings();
	
	if (launch_params) {
		Mojo.Log.info('AppAssistant.handleLaunch called with parameters.');
	}
	else {
		if (!this.try_focus_stage()) {
			this.prepare_services();
			this.launch_startup();
        }
	}
};

AppAssistant.prototype.try_focus_stage = function() {
	var existingController = this.controller.getStageController(Whendle.stage_name);
	if (existingController) {
		Mojo.Log.info('focusing stage');
		existingController.popScenesTo("clocks");    
		existingController.activate();
		return true;
	}
	return false;
};

AppAssistant.prototype.launch_startup = function() {
	var on_push_scene = function(stageController) {
		stageController.pushScene('startup');
	};

	this.controller.createStageWithCallback(
		{ name: Whendle.stage_name, lightweight: true },
		on_push_scene.bind(this), 'card');
};

AppAssistant.prototype.prepare_settings = function() {
	if (this.settings.is_empty()) {
	}
	if (this.settings.version() != Whendle.version) {
	}
	// this.settings.flush();
}

AppAssistant.prototype.prepare_services = function() {
	Whendle.services('Whendle.settings', this.settings);
	Whendle.services('Whendle.database', new Whendle.DatabaseService());
	Whendle.services('Whendle.schema', new Whendle.SchemaService(Whendle.database()));
};
