
// fixme - updating and refreshing goes away when the timekeeper handles time changes
describe 'Gallery'
	database = new Object
	timezones = new Object
	timekeeper = new Whendle.Observable
	view = new Whendle.View
	presenter = new Whendle.Gallery.Presenter(view, timekeeper, timezones, database)
	
	// begin fixme:
	timekeeper.time_format = function() { return ''; }
	// end fixme
	
	describe 'updating due to timekeeper changes'
		before
			a = null
			view.refresh = function(event) { a = event; }
			timekeeper.fire(Whendle.Events.system, 'test reason')
		end

		it 'refreshes the view'
			a.should.have_property 'reason', 'test reason'
		end
	end
end
