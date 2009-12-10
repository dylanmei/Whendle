
Mojo.Widget.Growler = Class.create({
	setup: function() {
		var id = this.make_identifier();
		this.render_widget(id);
		this.setup_children(id);
		this.attach_events();
		this.controller.exposeMethods(['information', 'dismiss']);
	},
	
	information: function(text) {
		this.text.innerHTML = text;
		this.reveal();
	},
	
	reveal: function() {
		var page = this.controller.element;
		if (page.visible()) return;
		
		var view_size = Mojo.View.getViewportDimensions(this.controller.document);
		var page_size = page.getDimensions();
		var page_left = (view_size.width / 2) - (page_size.width / 2);

		page.show();
		page.setStyle({
			top: '-4px',
			left: page_left + 'px'
		});
	},

	dismiss: function() {
		var page = this.controller.element;
		var size = page.getDimensions();
		var offset = page.viewportOffset();
		
		var speed = 1;
		var accelerate = 1.2;
		
		new PeriodicalExecuter(function(pe) {
			if (offset.top + size.height < 0) {
				pe.stop();
				page.hide();
			}
			else {
				speed *= accelerate;
				offset.top -= Math.round(speed);
				page.setStyle({
					top: offset.top + 'px'
				});
			}
		}, 0.01, this.controller.window);	
	},

	make_identifier: function() {
		return Mojo.View.makeUniqueId() +
			this.controller.scene.sceneId +
			this.controller.element.id;
	},
	
	render_widget: function(prefix) {
		var model = { 'id': prefix };
		var content = Mojo.View.render({object: model, template: 'templates/growler'});
		var element = this.controller.element;
		Element.insert(element, content);
		
		element.setStyle({
			display: 'none'
		});
		element.addClassName('growler');
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

