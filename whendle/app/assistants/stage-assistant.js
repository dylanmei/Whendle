
function StageAssistant() {
}

StageAssistant.prototype.setup = function() {
	this.bind_services();
	this.controller.pushScene('gallery');
}

StageAssistant.prototype.bind_services = function() {
	var ajax = new Whendle.AjaxService();
	var tzloader = new Whendle.TzLoader(ajax, Whendle.tzpath);
	var database = new Whendle.DatabaseService();

	Whendle.services('Whendle.system', new Whendle.PalmService());
	Whendle.services('Whendle.database', database);
	Whendle.services('Whendle.schema', new Whendle.SchemaService(database));
	Whendle.services('Whendle.clock-repository', new Whendle.Clock_Repository(database));
	Whendle.services('Whendle.timekeeper', new Whendle.TimekeeperService(Whendle.system()));
	Whendle.services('Whendle.timezone-locator', new Whendle.Timezone_Locator(ajax));
	Whendle.services('Whendle.timezone-repository', new Whendle.Timezone_Repository(tzloader));
	Whendle.services('Whendle.startup', new Whendle.StartupService(Whendle.schema(), Whendle.timekeeper()));
};
