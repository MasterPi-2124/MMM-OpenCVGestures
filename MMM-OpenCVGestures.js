Module.register('MMM-OpenCVGestures', {

	// init connection to server role and setup compliment module hiding/showing upon
	// events
	start: function () {

		Log.info('MMM-OpenCVGestures start invoked.');

		// notifications are only received once the client (this file) sends the first message to the server (node_helper.js)
		this.sendSocketNotification('INIT');

	},

  // Default module config.
  defaults: {
    text: "Hello World!",
  },

  // Override dom generator.
  getDom: function () {
    var wrapper = document.createElement("div");
    wrapper.innerHTML = this.config.text;
    return wrapper;
  },

});