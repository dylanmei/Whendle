
function StageAssistant() {
}

StageAssistant.prototype.setup = function() {
	this.bind_services();
	this.controller.pushScene('gallery');
}

StageAssistant.prototype.bind_services = function() {
	Whendle.services('Whendle.system', new Whendle.PalmService());
	Whendle.services('Whendle.database', new Whendle.DatabaseService());
	Whendle.services('Whendle.schema', new Whendle.SchemaService(Whendle.database()));
	Whendle.services('Whendle.timekeeper', new Whendle.TimekeeperService(Whendle.system()));
	
	var ajax = new Whendle.AjaxService();
	var tzloader = new Whendle.TzLoader(ajax, Whendle.tzpath);
	Whendle.services('Whendle.timezones', new Whendle.TimezoneService(ajax, tzloader));
	Whendle.services('Whendle.startup', new Whendle.StartupService(Whendle.schema(), Whendle.timekeeper()));
};
