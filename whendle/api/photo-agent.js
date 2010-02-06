// This file belongs to Whendle, a clock application for the Palm Pre
// http://github.com/dylanmei/Whendle

//
// Copyright (C) 2009-2010 Dylan Meissner (dylanmei@gmail.com)
//
// Permission is hereby granted, free of charge, to any person otaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

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
		resource += '&per_page=' + this.page_size;
		resource += '&radius=' + this.radius;
		resource += '&accuracy=1';
		resource += '&media=photos';
		resource += '&content_type=photos';
		resource += '&safe_search=1';
		resource += '&sort=date-posted-desc';
		resource += '&extras=owner_name,date_upload';
		resource += '&format=json';
		resource += '&nojsoncallback=1';

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
			message: $.string('photos_no_service')
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
