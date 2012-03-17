
Whendle.Profile = Class.create({
	initialize: function(cookie) {
		this.cookie = cookie || new Mojo.Model.Cookie('whendle');
	},

	get: function(name, default_if_empty) {
		var obj = this.cookie.get() || {};
		var value = obj[name];
		return !Object.isUndefined(value) ? value : default_if_empty;
	},

	set: function(name, value) {
		var obj = this.cookie.get() || {};
		obj[name] = value;
		this.cookie.put(obj);
	},

	remove: function(name) {
		var obj = this.cookie.get() || {};
		if (obj[name]) {
			delete obj[name];
			this.cookie.put(obj);
		}
	}
});
