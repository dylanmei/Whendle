
Whendle.Gallery = {
	Events: { loading: ':load', adding: ':add', removing: ':remove', ordering: ':order' }
};

Whendle.Gallery.View = Class.create(Whendle.Observable, {
	initialize: function($super) {
		$super();
	},

	// 	event = {
	//		now: { local: {}, utc: {}, hour_angle: #, declination: # },
	//		clocks: [{ id:#, title:'', subtitle:'', time:{}, display:'', day:'', latitude:#, longitude:# }],
	//		error: { message:'' }
	//	}
	loaded: function(event) {
	},

	// 	event = {
	//		now: { local: {}, utc: {}, hour_angle: #, declination: # },
	//		clocks: [{ id:#, title:'', subtitle:'', time:{}, display:'', day:'', latitude:#, longitude:# }],
	//		error: { message:'' }
	//	}
	added: function(event) {
	},

	// 	event = {
	//		clocks: [{ id:# }],
	//		error: { message:'' }
	//	}
	removed: function(event) {
	},

	// 	event = {
	//		clocks: [{ id:# }],
	//		error: { message:'' }
	//	}
	ordered: function(event) {
	},

	// 	event = {
	//		now: { local: {}, utc: {}, hour_angle: #, declination: # },
	//		clocks: [{ id:#, title:'', subtitle:'', time:{}, display:'', day:'', latitude:#, longitude:# }],
	//		reason: '',
	//		error: { message:'' }
	//	}
	changed: function(event) {
	}
});

Whendle.Gallery.Presenter = Class.create({
	initialize: function(view, timekeeper, timezone_locator, place_repository, sunlight_calculator, profile) {
		this.timekeeper = timekeeper || Whendle.timekeeper();
		this.timezone_locator = timezone_locator || Whendle.timezone_locator();
		this.place_repository = place_repository || Whendle.place_repository();
		this.sunlight_calculator = sunlight_calculator || Whendle.sunlight_calculator();
		this.profile = profile || Whendle.profile();

		this.wire_view(view);
		this.wire_timekeeper(view);
	},

	wire_view: function(view) {
		view.observe(Whendle.Gallery.Events.loading,
			this.on_loading.bind(this, view));
		view.observe(Whendle.Gallery.Events.adding,
			this._on_add_clock.bind(this, view));
		view.observe(Whendle.Gallery.Events.removing,
			this._on_remove_clock.bind(this, view));
		view.observe(Whendle.Gallery.Events.ordering,
			this._on_order_clocks.bind(this, view));
	},

	wire_timekeeper: function(view) {
		this.timekeeper.observe(Whendle.Timekeeper.Events.timer,
			this.tick_handler = this._on_timekeeping_tick.bind(this, view));
		this.timekeeper.observe(Whendle.Timekeeper.Events.system,
			this.system_handler = this._on_timekeeping_change.bind(this, view));
	},

	destroy: function() {
		if (this.tick_handler)
			this.timekeeper.ignore(Whendle.Timekeeper.Events.timer, this.tick_handler);
		if (this.system_handler)
			this.timekeeper.ignore(Whendle.Timekeeper.Events.system, this.system_handler);
	},

	on_loading: function(view) {
		this.load(this.on_places_loaded.bind(this, view));
	},

	load: function(on_complete) {

		this.place_repository.get_places(
			on_complete,
			function(error) { view.loaded({ 'clocks': [], 'error': error }); });
	},

	on_places_loaded: function(view, places) {
		var result = this.pack_clocks_for_view(places);
		view.loaded(result);
	},

	pack_clocks_for_view: function(places) {
		var now = this.timekeeper.time;
		var utc = this.timekeeper.utc;
		var format = this.select_time_format();

		var self = this;
		var clocks = places.collect(function(p) {
			p.time = self.offset_time(utc, p.timezone);
			return {
				id: p.id,
				title: p.name,
				subtitle: Whendle.Place.Format_area(p),
				display: Whendle.Place.Format_time(p.time, format),
				day: Whendle.Place.Format_day(now, p.time),
				time: p.time,
				longitude: p.longitude,
				latitude: p.latitude
			}
		});

		var result = {
			now: {
				time: now,
				utc: utc
			},
			clocks: clocks
		};

		if (this.sunlight_calculator) {
			result.now.hour_angle = this.sunlight_calculator.hour_angle(utc);
			result.now.declination = this.sunlight_calculator.declination(utc);
		}
		return result;
	},

	select_time_format: function() {
		return this.profile.get('time_format', this.timekeeper.format);
	},

	offset_time: function(utc, timezone) {
		if (!timezone) return utc;
		return utc.clone()
			.add(Time.minutes, timezone.offset(utc.date()));
	},

	_on_add_clock: function(view, event) {
		if (!event) return;
		var place = event.place;

		this.timezone_locator.lookup(
			place.latitude, place.longitude,
			this._on_timezone_result.bind(this, view, place),
			this._on_timezone_error.bind(this, view)
		);
	},

	_on_timezone_result: function(view, place, timezone) {
		place.timezone = timezone;
		this.place_repository.add_place(place,
			this._on_clock_added.bind(this, view, place),
			function(error) { view.added({ 'clocks': [], 'error': error }) }
		);
	},

	_on_timezone_error: function(view, error) {
		view.added({
			clocks: [],
			error: { message: $L('Hmm, the timezone service didn\'t like our request.') }
		});
	},

	_on_clock_added: function(view, place, identity) {
		place.id = identity;

		var result = this.pack_clocks_for_view([place]);
		view.added(result);
	},

	_on_remove_clock: function(view, event) {
		if (!event || !event.id) return;

		var on_complete = this._on_clock_removed.bind(this, view, event.id);
		this.place_repository.delete_place(event.id,
			on_complete,
			on_complete
		);
	},

	_on_clock_removed: function(view, id, error) {
		view.removed({
			'clocks': Object.isUndefined(error) ? [{ 'id': id }] : [],
			'error': error
		});
	},

	_on_order_clocks: function(view, event) {
		if (!event || !event.ids) return;

		var on_complete = this._on_clocks_ordered.bind(this, view, event.ids);
		this.place_repository.order_places(event.ids,
			on_complete,
			on_complete
		);
	},

	_on_clocks_ordered: function(view, ids, error) {
		view.ordered({
			'clocks': Object.isUndefined(error) ? ids : [],
			'error': error
		});
	},

	_on_timekeeping_change: function(view, reason) {
		this.load(this.on_clocks_changed.bind(this, view, reason));
	},

	_on_timekeeping_tick: function(view, time) {
		this._on_timekeeping_change(view, 'time');
	},

	on_clocks_changed: function(view, reason, clocks) {

		var result = this.pack_clocks_for_view(clocks);
		result.reason = reason;
		view.changed(result);
	}
});