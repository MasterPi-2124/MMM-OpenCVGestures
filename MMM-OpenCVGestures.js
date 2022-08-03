Module.register("MMM-OpenCVGestures", {

  // Default module config.
  defaults: {
    message: "Hello World!",
    file: ""
  },

	start: function () {
		Log.info('MMM-OpenCVGestures start invoked.');
    // file = 
    // var timer = setInterval(() => {
    // }, 5000)
    this.checkCompatibility(); // cant run on server side
	},

  checkCompatibility: function () {
    let onlyHas = [];
    navigator.mediaDevices.enumerateDevices()
    .then(devices => {
      let video = audio = false;
      devices.forEach(device => {
        console.log("[OP]: ", device.kind)
        if (device.kind == "audioinput") {
          onlyHas.push(device.kind);
          audio = true;
        } else if (device.kind == "videoinput") {
          onlyHas.push(device.kind);
          video = true;
        }
      });
      
      if (video == true && audio == true) {
        this.config.message = "all devices OK";
        console.log("[OP]: ", this.config.message);
        this.updateDom();
      } else {
        console.log("[OP]: ", onlyHas);
        this.config.message = "all devices not OK";
        console.log("[OP]: ", this.config.message);
        this.updateDom();
      }
    })
    .catch(function(err) {dfgdfg
      console.log("[OP]: ", err.name + ": " + err.message);
    });
  },

  // Override dom generator.
  getDom() {
    var wrapper = document.createElement("div");
    wrapper.innerHTML = this.config.message;
    return wrapper;
  },

  socketNotificationReceived(notification, payload) {
    this.config.message = notification;
    console.log("[OP]: ", notification)
    this.updateDom();
  },

});