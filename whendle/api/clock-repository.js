
Whendle.Clock_Repository = Class.create({
	initialize: function(database) {
		this.database = database;
	},
	
	get_clocks: function(on_complete, on_error) {
		var mapper = this.map_records_to_clocks.bind(this);
		this.database.rowset('select * from clocks', [],
			function(results) {
				on_complete(
					results ? results.collect(mapper) : []
				);
			},
			on_error
		);
	},
	
	get_clock: function(id, on_complete, on_error) {
		var mapper = this.map_records_to_clocks.bind(this);
		this.database.rowset('select * from clocks where id=?', [id],
			function(results) {
				var clock = null;
				results = results ? results.collect(mapper) : [];
				if (results.length) clock = results[0];
				on_complete(clock);
			},
			on_error
		);		
	},
	
	map_records_to_clocks: function(r) {
		return {
			'id': r.id,
			'name': r.location,
			'timezone': r.timezone,
			'place': Whendle.Clock.Format_place(r.location, r.district, r.country),
			'latitude': r.latitude,
			'longitude': r.longitude
		}
	},
	
	put_clock: function(timezone, location, on_complete, on_error) {
		this.database.insert(
			'insert into clocks (location,district,country,latitude,longitude,timezone,offset) values (?,?,?,?,?,?,?)',
			[
				location.name,
				location.district,
				location.country,
				location.latitude,
				location.longitude,
				timezone.name,
				timezone.offset
			],
			on_complete,
			on_error
		);	
	},
	
	delete_clock: function(id, on_complete, on_error) {
		this.database.remove('delete from clocks where id=?', [id], on_complete, on_error);	
	}
});