// This file belongs to Whendle, a clock application for the Palm Pre
// http://github.com/dylanmei/Whendle

//
// Copyright (C) 2009 Dylan Meissner (dylanmei@gmail.com)
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

Whendle.Wait = Class.create({
	initialize: function(callback) {
		this._activities = [];
		this._callback = callback;
	},
	
	on: function(activity) {
		this._ready = false;

		if (!activity)
			activity = function() {};

		this._activities.push(activity);
		return this._on_activity.bind(this, activity);
	},
	
	complete: function() {
		return this._activities.length == 0;
	},
	
	ready: function() {
		this._ready = true;
		this._try_callback();
	},
	
	_try_callback: function() {
		if (this.complete() && this._ready) {
			if (this._callback) this._callback();
		}
	},

	_on_activity: function(activity) {
		var args = $A(arguments);
		args.shift();
		activity.apply(0, args);

		this._activities = this._activities
			.reject(function(a) { return a === activity; });
		
		this._try_callback();
	}
});