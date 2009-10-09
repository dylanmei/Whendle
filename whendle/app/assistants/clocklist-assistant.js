
ClocklistAssistant = Class.create(Class.Observable, {
	initialize: function() {
//		this._presenter = new Whendle.ClicklistPresenter(this);
	},
	
	setup: function() {
		Mojo.Log.info('setting up clocks scene...');
		
//		this.fire(':loadready', {
//			'load': this.on_load.bind(this)
//		});
	},
	
//	on_load: function(event) {
//		Mojo.Log.info('on_load fired');
//	},
	
	activate: function(event) {
		Mojo.Log.info('activating clocks scene...');
	},
	
	deactivate: function(event) {
		Mojo.Log.info('deactivating clocks scene...');
	},
	
	cleanup: function(event) {
		Mojo.Log.info('cleaning up clocks scene...');
	}
});