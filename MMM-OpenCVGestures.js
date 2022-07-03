Module.register('MMM-OpenCVGestures', {

	// init connection to server role and setup compliment module hiding/showing upon
	// events
	start: function () {

		Log.info('MMM-OpenCVGestures start invoked.');

		// notifications are only received once the client (this file) sends the first message to the server (node_helper.js)
		this.sendSocketNotification('INIT');

	},

	// hide compliment module by default, until PRESENT gesture is received
	notificationReceived: function(notification, payload, sender) {

		// hide compliment module by default after all modules were loaded
		if (notification == 'ALL_MODULES_STARTED'){

			var complimentModules = MM.getModules().withClass('compliments');

			if(complimentModules && complimentModules.length == 1){

				Log.info('Hiding compliment module since all modules were loaded.');
				var compliment = complimentModules[0];
					compliment.hide();

			}

		}

	},

	// Override socket notification handler.
	// On message received from gesture server forward message to other modules
	// and hide / show compliment module
	socketNotificationReceived: function(notification, payload) {
		
		Log.info('Received message from gesture server: ' + notification + ' - ' + payload);

		// forward gesture to other modules
		this.sendNotification('GESTURE', {gesture:payload});

		// interact with compliments module upon PRESENT and AWAY gesture
		var complimentModules = MM.getModules().withClass('compliments');

		if(complimentModules && complimentModules.length == 1){

			var compliment = complimentModules[0];

			if(payload == 'PRESENT'){

				Log.info('Showing compliment after having received PRESENT gesture.');
				compliment.show();

			} else if(payload == 'AWAY'){

				Log.info('Hiding compliment after having received AWAY gesture.');
				compliment.hide();

			} else if(payload == 'FAR'){

				Log.info('Reloading page after having received FAR gesture.');
				location.reload();

			} else if(payload == 'NEAR'){

				Log.info('Showing next page after having received NEAR gesture.');
				this.sendNotification("PAGE_INCREMENT");

			} else {

				Log.info('Not handling received gesture in this module directly:');
				Log.info(payload);

			}
		}

		// interact with newsfeed module upon UP, DOWN, LEFT, RIGHT gesture
		var newsfeedModules = MM.getModules().withClass('newsfeed');

		if(newsfeedModules){

			var notification = "UNKNOWN";

			// reverting orders since sensor is usually built in upside down
			if(payload == 'LEFT'){
				notification = "ARTICLE_NEXT";
			} else if(payload == 'RIGHT'){
				notification = "ARTICLE_PREVIOUS";
			} else if(payload == 'UP'){
				notification = "ARTICLE_LESS_DETAILS";
			} else if(payload == 'DOWN'){
				notification = "ARTICLE_MORE_DETAILS";
			} else {
				Log.info('Not handling received gesture in this module directly:');
				Log.info(payload);
			}

			// forward gesture to other modules
			Log.info('Sending notification: ' + notification + '.');
			this.sendNotification(notification);

		}

	},

});
ko