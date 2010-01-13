
Mojo.Widget.Splash = Class.create({
	setup: function() {
		var id = this.make_identifier();
		this.render_widget(id);
		this.setup_children(id);
		this.attach_events();
		this.controller.exposeMethods(['message', 'interactive', 'dismiss']);
	},
	
	dismiss: function(force) {
		if (!force && !this.interactive()) return;
		
		this.text.hide();
		this.controller.element.addClassName('dismiss');
	},
	
	interactive: function(b) {
		if (b === undefined) return this.locked || false;
		this.locked = b;
	},
	
	message: function(text) {
		if (text === undefined) return this.text.innerHTML;
		this.text.innerHTML = text;
	},
	
	make_identifier: function() {
		return Mojo.View.makeUniqueId() +
			this.controller.scene.sceneId +
			this.controller.element.id;
	},
	
	render_widget: function(prefix) {
		var model = { 'id': prefix, 'message': $.string('splash_message_default') };
		var content = Mojo.View.render({object: model, template: 'templates/splash'});
		Element.insert(this.controller.element, content);
		
		var page = this.controller.element;
		var size = Mojo.View.getViewportDimensions(this.controller.document);
		
		page.addClassName('splash-page');
		page.setStyle({
			width: size.width + 'px',
			height: size.height + 'px'
		});
	},
	
	setup_children: function(prefix) {
		this.text = this.controller.get(prefix + '-text');
		this.controller.instantiateChildWidgets();
	},
	
	attach_events: function() {
	},

	cleanup: function() {
		this.detach_events();
	},
	
	detach_events: function() {
	}
});