DatabaseService = Class.create({
	rowset: function(statement, parameters, on_results, on_error) {
		if (statement == 'select * from places') {
			on_results(document.clocks);
		}
	},
	
	insert: function(statement, parameters, on_results, on_error) {
		if (statement.startsWith('insert into places')) {
			var id = document.clocks.length + 1;
			document.clocks.push({
				'id': id,
				'name': parameters[0],
				'admin': parameters[1],
				'country': parameters[2],
				'longitude': parameters[3],
				'latitude': parameters[4],
				'timezone': parameters[5],
				'woeid': parameters[6],
				'type': parameters[7]
			});
			on_results(id);
		}
	},

	remove: function(statement, parameters, on_results, on_error) {
		if (statement.startsWith('delete from places')) {
			var id = parameters[0];
			document.clocks = document.clocks.reject(function(c) {
				return c.num == id;
			});
			on_results(id);
		}
	}
});