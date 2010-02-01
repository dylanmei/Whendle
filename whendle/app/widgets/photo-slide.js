Photo_Slide = Class.create({
	initialize: function() {
		this.info = new Element('div', { 'class': 'photo-slide-tray' });
		this.image = this.new_image();
	},
	
	setup: function(clock) {
		this.longitude = clock.longitude;
		this.latitude = clock.latitude;
		this.photos = [];
	},
	
	new_image: function() {
		var image = new Image();
		image.getWidth = function() {
			return this.width;
		};
		image.getHeight = function() {
			return this.height;
		};
		return image;
	},
	
	tray: function() {
		return this.info;
	},
	
	backdrop: function() {
		//return this.display;
		return this.image;
	},

	in_error_state: function() {
		return false;
	},
	
	invoke: function(on_ready) {
		if (this.photos.length) {
			this.next_photo(this.pop_random_photo(), on_ready);
		}
		else {
			new Whendle.Photo_Agent(this.longitude, this.latitude).get(
				this.on_photo_search.bind(this, on_ready),
				this.on_photo_error.bind(this, on_ready)
			);
		}
	},
	
	pop_random_photo: function() {
		var photo = this.photos[Math.floor(Math.random() * this.photos.length)];
		this.photos = this.photos.without(photo);
		return photo;
	},
	
	next_photo: function(photo, on_ready) {
		this.image.onload = this.on_photo_ready.bind(this, photo, on_ready);
		this.image.src = Flickr.photo_src(photo);
	},
	
	on_photo_ready: function(photo, on_ready) {
		this.compose_photo_info(photo);
		on_ready(this.tray(), this.backdrop());
	},
	
	on_photo_search: function(on_ready, data) {
		this.photos = data.photos;
		this.next_photo(this.pop_random_photo(), on_ready);
	},
	
	on_photo_error: function(on_ready, error) {
		$.trace('error');
	},
	
	compose_photo_info: function(photo) {
		this.clear_tray();
		
		this.info.insert(this.new_photo_title(photo));
		this.info.insert(this.new_photo_attribution(photo));
	},
	
	new_photo_title: function(photo) {
		var title = photo.title.stripTags();
		if (title.blank()) title = $.string('photo_empty_title');
		else title = title.truncate(80, $.string('truncate_ellipses'));
		
		var url = Flickr.photo_url(photo);
		return new Element('div', { 'class': 'title' })
			.update(title)
			.observe('click', function() {
				$.trace(url);
			});
	},
	
	new_photo_attribution: function(photo) {
		var container = new Element('div', {'class': 'attribution'});

		container.insert(new Element('span').update($.string('photo_attribution')));
		container.insert(new Element('span', { 'class': 'who' }).update(photo.ownername));
	
		var then = photo.dateupload;
		var now = Time.now().add(
			Time.minutes,
			new Date().getTimezoneOffset());

		var when = this.format_time_ago(now, then);
		container.insert(new Element('span').update(when));
		
		return container;
	},
	
	clear_tray: function() {
		this.info.childElements()
			.each(function(c) { c.remove(); });
	},
	
	format_time_ago: function(now, then) {
		return Time.Format_time_ago(now, then);
	}	
});