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
				'woeid': parameters[0],
				'name': parameters[1],
				'admin': parameters[2],
				'country': parameters[3],
				'longitude': parameters[4],
				'latitude': parameters[5],
				'timezone': parameters[6]
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