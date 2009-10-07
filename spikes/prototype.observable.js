// Mixin for adding custom events to a ui class
// Credit to Joe Gornick, Juriy Zaytsev
// http://prototype.lighthouseapp.com/projects/8886/tickets/329-possible-addition-eventbinder-class-encapsulates-an-entire-event

Class.Observable = Class.create({
	initialize: function(element) {
		this._element = element || new Element('code');
	},

	observe: function(eventName, handler) {
		this._element.observe(eventName, handler);
		return this;
	},

	stopObserving: function(eventName, handler) {
		this._element.stopObserving(eventName, handler);
		return this;
	},

	fire: function(eventName, memo) {
		this._element.fire(eventName, memo);
		return this;
	}	
});

