
Mojo.Widget.Clockmap = Class.create({
	setup: function() {
		var id = this.make_identifier();
		this.render_widget(id);
		this.setup_children(id);
		this.attach_events();
		this.controller.exposeMethods(['show', 'hide']);
	},
	
	show: function() {
		var element = this.controller.element;
		element.show();
		element.removeClassName('hide');
	},
	
	hide: function() {
		this.controller.element.addClassName('hide');
	},
	
	make_identifier: function() {
		return Mojo.View.makeUniqueId() +
			this.controller.scene.sceneId +
			this.controller.element.id;
	},
	
	render_widget: function(prefix) {
		var model = { 'id': prefix };
		var content = Mojo.View.render({
			  object: model
			, template: 'templates/clock-map'
		});

		var element = this.controller.element;
		Element.insert(element, content);
		element.addClassName('map');
		
		$.trace('render_widget');
		var attributes = this.controller.attributes || {};
		if (attributes.visible) {
			this.show();
		}
		else {
			//this.hide();
			//element.hide();
			element.addClassName('hide');
		}
	},
	
	setup_children: function(prefix) {
		this.core = this.controller.get(prefix + '-core');
		this.seam = this.controller.get(prefix + '-seam');
		this.controller.instantiateChildWidgets();
		
		var ctx = this.core.getContext('2d');
		ctx.beginPath();
		ctx.moveTo(80, 80);
		ctx.lineTo(100, 100);
		ctx.strokeStyle = 'black';
		ctx.stroke();
	},
	
	attach_events: function() {
	},

	cleanup: function() {
		this.detach_events();
	},
	
	detach_events: function() {
	}
});

