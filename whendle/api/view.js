Whendle.View = Class.create({
	initialize: function() {
		this._hash = new Hash();
	},
	
	observe: function(name, handler) {
		var handlers = this.handlers(name);
		if (handlers) {
			handlers.push(handler);
		}
		else {
			this._hash.set(name, [handler]);
		}
	},
	
	handlers: function(name) {
		return this._hash.get(name);
	},
	
	fire: function(name, data) {
		(this.handlers(name) || [])
			.each(function(f) { f(data); });
	}
});