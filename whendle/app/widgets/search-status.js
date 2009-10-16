
Mojo.Widget.SearchStatus = Class.create({
	setup: function() {
		var id = this.make_identifier();
		this.render_widget(id);
		this.setup_children(id);
		this.controller.exposeMethods(['spin', 'stop', 'reset']);
	},
	
	make_identifier: function() {
		return Mojo.View.makeUniqueId() +
			this.controller.scene.sceneId +
			this.controller.element.id;
	},
	
	render_widget: function(prefix) {
		var model = { 'id': prefix };
		var content = Mojo.View.render({object: model, template: 'templates/search-status'});
		Element.insert(this.controller.element, content);
	},
	
	setup_children: function(prefix) {
		this.text = this.controller.get(prefix + '-text');
		this.spinner = this.controller.get(prefix + '-spinner');
		this.controller.scene.setupWidget(
			this.spinner.id,
			{ 'spinnerSize': 'small' },
			{ 'spinning': false }
		);
		
		this.controller.instantiateChildWidgets();
	},
	
	spin: function(message) {
		this.spinner.mojo.start();
		this.text.update(message);
	},
	
	stop: function(message) {
		this.spinner.mojo.stop();
		this.text.update(message);
	},
	
	reset: function() {
		this.stop('');
	},
	
	cleanup: function() {
		this.controller.stopListening(this.text.id,
			Mojo.Event.tap, this.text.tap_handler);
	}
});