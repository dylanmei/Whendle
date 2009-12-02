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

Date.today = function() {
	var now = Date.current();
	now.setMilliseconds(0);
	now.setSeconds(0);
	now.setMinutes(0);
	now.setHours(0);
	return now;
}

Date.current = function() {
	return new Date();
}

Date.to_object = function(date) {
	return {
		'year': date.getFullYear(),
		'month': date.getMonth() + 1,
		'day': date.getDate(),
		'hour': date.getHours(),
		'minute': date.getMinutes(),
		'second': date.getSeconds()
	};
}

Date.from_object = function(obj) {
	return new Date(obj.year, obj.month - 1, obj.day, obj.hour, obj.minute, obj.second);
}

Date.prototype.copy = function() {
	return new Date(this.getTime());
}

Date.prototype.day = function() {
	var d = this.copy();
	d.setMilliseconds(0);
	d.setSeconds(0);
	d.setMinutes(0);
	d.setHours(0);
	return d;
}

Date.prototype.addYears = function(n) {
	 this.setFullYear(this.getFullYear() + n);
}
Date.prototype.addMonths = function(n) {
	this.setMonth(this.getMonth() + n, this.getDate());
}
Date.prototype.addDays = function(n) {
	this.setDate(this.getDate() + n);
}
Date.prototype.addHours = function(n) {
	this.setHours(this.getHours() + n);
}
Date.prototype.addMinutes = function(n) {
	this.setMinutes(this.getMinutes() + n, this.getSeconds(), this.getMilliseconds());
}

Date.prototype.__defineGetter__('ISO', function() {
	return this.getUTCFullYear() + '-'
		+ (this.getUTCMonth() + 1).toPaddedString(2) + '-'
		+ (this.getUTCDate()).toPaddedString(2) + 'T'
		+ (this.getUTCHours()).toPaddedString(2) + ':'
		+ (this.getUTCMinutes()).toPaddedString(2) + ':'
		+ (this.getUTCSeconds()).toPaddedString(2) + 'Z';
});

Date.prototype.__defineGetter__('Local', function() {
	return this.getFullYear() + '-'
		+ (this.getMonth() + 1).toPaddedString(2) + '-'
		+ (this.getDate()).toPaddedString(2) + ' '
		+ (this.getHours()).toPaddedString(2) + ':'
		+ (this.getMinutes()).toPaddedString(2) + ':'
		+ (this.getSeconds()).toPaddedString(2);	
});
