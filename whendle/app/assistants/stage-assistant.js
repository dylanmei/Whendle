
function StageAssistant() {
}

StageAssistant.prototype.setup = function() {
	this.setup_services();
	this.controller.pushScene('startup');
}

StageAssistant.prototype.setup_services = function() {
	var ajax = new Whendle.AjaxService();
	var database = new Whendle.DatabaseService();

	Whendle.services('Whendle.system', new Whendle.PalmService());
	Whendle.services('Whendle.profile', new Whendle.Profile());
	Whendle.services('Whendle.database', database);
	Whendle.services('Whendle.schema', new Whendle.SchemaService(database));
	Whendle.services('Whendle.place-repository', new Whendle.Place_Repository(database));
	Whendle.services('Whendle.place-locator', new Whendle.Place_Locator(ajax));
	Whendle.services('Whendle.timezone-locator', new Whendle.Timezone_Locator(ajax, new Whendle.TzLoader(ajax, Whendle.tzpath)));
	Whendle.services('Whendle.timekeeper', new Whendle.TimekeeperService(Whendle.system()));
	Whendle.services('Whendle.startup', new Whendle.StartupService(Whendle.schema(), Whendle.timekeeper()));
	Whendle.services('Whendle.sunlight-calculator', new Whendle.Sunlight_Calculator());
};

StageAssistant.prototype.handleCommand = function(event) {
	if (event.type == Mojo.Event.commandEnable) {
		if (event.command == Mojo.Menu.helpCmd) {
			event.stopPropagation();
		}

		if (event.command == Mojo.Menu.prefsCmd) {
			event.stopPropagation();
		}
	}

	if (event.type != Mojo.Event.command) return;

	if (event.command == 'add') {
		this.controller.pushScene({ name: 'finder' });
	}
	else if (event.command =='list' || event.command == 'map') {
		var scene = this.controller.activeScene();
		var swap_params = {
			name: event.command,
			transition: Mojo.Transition.crossFade
		};
		
		if (event.command == 'list' && scene.sceneName == 'list') return;
		if (event.command == 'map') {
			if (scene.sceneName == 'map') return;
			swap_params.disableSceneScroller = true;
		}  
		
		this.controller.swapScene(swap_params);
	}
	else if (event.command == Mojo.Menu.helpCmd) {
		this.controller.pushScene({ name: 'help' });
	}
	else if (event.command == Mojo.Menu.prefsCmd) {
		this.controller.pushScene({ name: 'prefs' });
	}
}

StageAssistant.Gallery_menu = {
	attributes: {
	},
	model: {
		visible: false,
		items: [{
			toggleCmd: '',
			items: [
				{ label: $L('menu_map'), iconPath: 'resources/menu-icon-globe.png', command: 'map' },
				{ label: $L('menu_list'), iconPath: 'resources/menu-icon-list.png', command: 'list' }
			]
		},
		{ label: $L('menu_find'), iconPath: 'resources/menu-icon-find.png', command: 'add' }
	]}
};