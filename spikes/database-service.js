DatabaseService = Class.create({
	rowset: function(statement, parameters, on_results, on_error) {
		if (statement == 'select * from clocks') {
			on_results(document.clocks);
		}
	},
	
	insert: function(statement, parameters, on_results, on_error) {
		if (statement.startsWith('insert into clocks')) {
			var id = document.clocks.length + 1;
			document.clocks.push({ 'id': id, 'location': parameters[0], 'district': parameters[1], 'country': parameters[2],
				'latitude': parameters[3], 'longitude': parameters[4], 'timezone': parameters[5] });
			on_results(id);
		}
	},
	
	remove: function(statement, parameters, on_results, on_error) {
		if (statement.startsWith('delete from clocks')) {
			var id = parameters[0];
			document.clocks = document.clocks.reject(function(c) {
				return c.id == id;
			});
			on_results(id);
		}
	}
});