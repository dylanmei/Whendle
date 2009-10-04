
Whendle.SettingsService = Class.create({
	initialize: function(cookie) {
		this._cookie = cookie || new Mojo.Model.Cookie('whendle-settings');
		this._data = this._cookie.get() || {};
	},
	
	is_empty: function() {
		return this.version() === undefined;
	},
	
	flush: function() {
		this._cookie.put({
			version: this.version()
		});
	},

	version: function(v) {
		if (arguments.length) {
			this._data.version = v;
		}
		return this._data.version;
	}
});
    
	/*
    initialize: function()  {
        // Update globals with preferences or create it.
        // With v0.4 start migrating preferences
        this.cookieData = new Mojo.Model.Cookie("comPalmAppNewsPrefs");
        var oldNewsPrefs = this.cookieData.get();
        if (oldNewsPrefs && oldNewsPrefs.newsVersionString) {
            // Create cookie or update News globals if preferences already exists
            if (oldNewsPrefs.newsVersionString == News.versionString)    {
                    News.featureFeedEnable = oldNewsPrefs.featureFeedEnable;
                    News.featureStoryInterval = oldNewsPrefs.featureStoryInterval;
                    News.feedUpdateInterval = oldNewsPrefs.feedUpdateInterval;
                    News.versionString = oldNewsPrefs.newsVersionString;
                    News.notificationEnable = oldNewsPrefs.notificationEnable;
                    News.feedUpdateBackgroundEnable = oldNewsPrefs.feedUpdateBackgroundEnable;
                    News.updateDialog = false;
             } else {
                 // migrate old preferences here on updates of News app     
                 switch (oldNewsPrefs.newsVersionString) {
        
                    case "0.4" :
                    // last DB version, capture prefs and set update flag to "0.4" to convert after first database read
                    if (oldNewsPrefs.featureStoryInterval !== undefined) {
                        News.featureStoryInterval = oldNewsPrefs.featureStoryInterval;
                    }
                    if (oldNewsPrefs.feedUpdateInterval !== undefined) {
                        News.feedUpdateInterval = oldNewsPrefs.feedUpdateInterval;
                    News.dbUpdate = "0.4";
                    }
                    break;
            
                    case "0.6" : 
                        switch (News.feedUpdateInterval) {
                            case "300000" :
                                News.feedUpdateInterval = "00:00:30";
                            break;
                    
                            case "900000" :
                                News.feedUpdateInterval = "00:05:00";
                            break;
                    
                            case "3600000" :
                                News.feedUpdateInterval = "00:15:00";
                            break;
                    
                            case "14400000" :
                                News.feedUpdateInterval = "04:00:00";
                            break;
                    
                            case "86400000" :
                                News.feedUpdateInterval = "23:59:59";
                            break;
                        }
                    break;
                    
                    case "0.77" : 
                        News.featureFeedEnable = oldNewsPrefs.featureFeedEnable;
                        News.featureStoryInterval = oldNewsPrefs.featureStoryInterval;
                        News.feedUpdateInterval = oldNewsPrefs.feedUpdateInterval;
                        News.versionString = oldNewsPrefs.newsVersionString;
                        News.notificationEnable = oldNewsPrefs.notificationEnable;
                        News.feedUpdateBackgroundEnable = oldNewsPrefs.feedUpdateBackgroundEnable;
                    break;
                    
                    //  Removed News.featureIndexFeed
                    case "0.83" : 
                        News.featureFeedEnable = oldNewsPrefs.featureFeedEnable;
                        News.featureStoryInterval = oldNewsPrefs.featureStoryInterval;
                        News.feedUpdateInterval = oldNewsPrefs.feedUpdateInterval;
                        News.versionString = oldNewsPrefs.newsVersionString;
                        News.notificationEnable = oldNewsPrefs.notificationEnable;
                        News.feedUpdateBackgroundEnable = oldNewsPrefs.feedUpdateBackgroundEnable;
                    break;
                }            
            }
        }

        this.storeCookie();
        
    },
    
    //  store - function to update stored cookie with global values
    storeCookie: function() {
        // For version 0.7 and beyond, extend stored preferences 
        // to News.notificationEnable and feedUpdateBackgroundEnable
        this.cookieData.put(    {  
            featureFeedEnable: News.featureFeedEnable,                                                
            feedUpdateInterval: News.feedUpdateInterval,
            featureStoryInterval: News.featureStoryInterval,
            newsVersionString: News.versionString,
            notificationEnable: News.notificationEnable,
            feedUpdateBackgroundEnable: News.feedUpdateBackgroundEnable
        });
    }
	
	*/
