
Whendle.Photo_Agent = Class.create({
	//http://www.flickr.com/services/api/flickr.photos.search.html

	initialize: function(longitude, latitude) {
		//this.woeid = woeid || 2502265;
		this.page_size = 25;
		this.radius = 20;
		this.latitude = latitude;
		this.longitude = longitude;
	},

	get: function(on_complete, on_error) {
		var resource = 'http://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=' + Flickr.APPID;
//		resource += '&woe_id=' + this.woeid;
		resource += '&lat=' + this.latitude;
		resource += '&lon=' + this.longitude;
		resource += '&page=1';
		resource += '&per_page=' + this.page_size;
		resource += '&radius=' + this.radius;
		resource += '&min_taken_date=2000-01-01 00:00:00';
		resource += '&accuracy=1';
		resource += '&media=photos&content_type=photos';
		resource += '&safe_search=1';
		resource += '&sort=date-posted-desc';
		resource += '&extras=owner_name,date_upload';
		resource += '&format=json&nojsoncallback=1';

		new Ajax.Request(resource, {
			method: 'get',
			asynchronous: true,
			onSuccess: this.on_response_data.bind(this, on_complete, on_error),
			onFailure: this.on_response_error.bind(this, on_error)
		});
	},

	on_response_data: function(on_complete, on_error, transport) {
		var response = transport.responseText;
		if (response.isJSON()) {
			response = response.evalJSON();
		}

		if (this.is_flickr_error(response)) {
			on_error(this.json_to_error(response));
		}
		else {
			on_complete({ photos: this.json_to_photos(response) });
		}
	},

	on_response_error: function(on_error, error) {
		on_error(error);
	},

	json_to_error: function(data) {
		return {
			code: data.code,
			//message: data.message,
			message: $L('Hmm, the photo service didn\'t like our request.')
		};
	},

	json_to_photos: function(data) {
		var root = data.photos;
		var self = this;

		return root.photo.collect(function(obj) {
			return {
				id: obj.id,
				farm: obj.farm,
				server: obj.server,
				secret: obj.secret,
				owner: obj.owner,
				ownername: obj.ownername,
				title: obj.title,
				dateupload: self.ticks_to_time(obj.dateupload)
			};
		});
	},

	is_flickr_error: function(data) {
		return data.stat != 'ok';
	},

	ticks_to_time: function(ticks) {
		var date = Flickr.photo_posted_date(parseInt(ticks));
		return new Time().date(date);
	}
});
