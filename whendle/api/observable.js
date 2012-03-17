
Whendle.Observable = Class.create({
	initialize: function() {
		this._hash = new Hash();
	},
	
	observe: function(name, handler) {
		var handlers = this.handlers(name);
		if (handlers.length) {
			handlers.push(handler);
		}
		else {
			this._hash.set(name, [handler]);
		}
	},
	
	ignore: function(name, handler) {
		if (!name) return;
		if (!handler) this._hash.unset(name);
		else {
			var handlers = this.handlers(name)
				.without(handler);
			this._hash.set(name, handlers);
		}
	},
	
	handlers: function(name) {
		return this._hash.get(name) || [];
	},
	
	fire: function(name, data) {
		this.handlers(name)
			.each(function(f) { f(data); });
	}
});