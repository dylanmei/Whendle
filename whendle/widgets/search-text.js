
Mojo.Widget.SearchText = Class.create({
	setup: function() {
		var id = this.make_identifier();
		this.render_widget(id);
		this.setup_children(id);
		this.attach_events();
	},
	
	make_identifier: function() {
		return Mojo.View.makeUniqueId() +
			this.controller.scene.sceneId +
			this.controller.element.id;
	},
	
	render_widget: function(prefix) {
		var model = { 'id': prefix };
		var content = Mojo.View.render({object: model, template: 'templates/search-text'});
		Element.insert(this.controller.element, content);
	},
	
	setup_children: function(prefix) {
		this._writebox = this.controller.get(prefix + '-writer');
		this._readbox = this.controller.get(prefix + '-reader');
		this.controller.instantiateChildWidgets();
	},
	
	attach_events: function() {
		this.controller.listen(
			this.controller.scene.sceneElement,
			Mojo.Event.keydown,
			this._scene_keydown_handler = this.on_keydown.bind(this, this.controller.scene.sceneElement),
			true
		);
		
		this.controller.listen(
			this._writebox,
			'keydown',
			this._field_keydown_handler = this.on_keydown.bind(this, this._writebox),
			true
		);

		this.controller.listen(
			this._writebox,
			'keyup',
			this._field_keyup_handler = this.on_keyup.bind(this)
		);
	},

	on_keydown: function(sender, event) {
		if (Mojo.Char.isEnterKey(event.keyCode)) {
			Event.stop(event);
			return true;
		}
	
		if (sender != this._writebox) {
			if (event.originalEvent.target != this._writebox) {
				this._writebox.focus();
			}
		}
	},
	
	on_keyup: function(event) {
		if (Mojo.Char.isEnterKey(event.keyCode)) {
			Event.stop(event);
			return true;
		}
		
		if ((event.ctrlKey || event.keyCode < 32 || event.keyCode === 127) &&
			(event.keyCode !== Mojo.Char.backspace) && !Mojo.Char.isDeleteKey(event.keyCode)) {
			return;
		} 
		
		this.update_text();	
	},
	
	update_text: function() {
		this._readbox.innerText = this._writebox.value;
		this.notify_change();
	},
	
	notify_change: function() {
//		Mojo.Event.send(this.controller.element, Mojo.Event.filterImmediate,
//			{ 'filterString': this._writebox.value });

		if (this._timer) {
			this.controller.window.clearTimeout(this._timer);
			this.clear_timer();
		}

		this._timer = this.controller.window.setTimeout(
			this.fire_notify_change.bind(this), this.delay || 500);
	},
	
	fire_notify_change: function() {
		if (this._timer) {
			this.clear_timer();
			Mojo.Event.send(this.controller.element, Mojo.Event.filter,
				{ 'filterString': this._writebox.value });
		}
	},
	
	cleanup: function() {
		this.clear_timer();
		this.detach_events();
	},
	
	this.clear_timer: function() {
		this._timer = undefined;
	},
	
	detach_events: function() {
		this.controller.stopListening(this.controller.scene.sceneElement, Mojo.Event.keydown, this._scene_keydown_handler);
		this.controller.stopListening(this._writebox, 'keydown', this._field_keydown_handler);
		this.controller.stopListening(this._writebox, 'keyup', this._field_keyup_handler);
	}
});