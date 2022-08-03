Module.register("MMM-OpenCVGestures", {

  // Default module config.
  defaults: {
    message: "Hello World!",
    file: ""
  },

	start: function () {
		Log.info('MMM-OpenCVGestures start invoked.');
    // file = 
    var timer = setInterval(() => {
      this.checkCompatibility(); // cant run on server side
    }, 5000)
	},

  checkCompatibility: function () {
    let onlyHas = [];
    navigator.mediaDevices.enumerateDevices()
    .then(devices => {
      let video = audio = false;
      devices.forEach(device => {
        if (device.kind == "audioinput") {
          onlyHas.push(device.kind);
          audio = true;
        } else if (device.kind == "videoinput") {
          onlyHas.push(device.kind);
          video = true;
        }
      });
      
      if (video == true && audio == true) {
        console.log("camera and audio detected");
        this.config.message = "all devices OK";
        console.log(this.config.message);
        this.updateDom();
      } else {
        console.log("camera and audio not work");
        Log.log(onlyHas);
        this.config.message = "all devices not OK";
        console.log(this.config.message);
        this.updateDom();
      }
    })
    .catch(function(err) {dfgdfg
      console.log(err.name + ": " + err.message);
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
    this.updateDom();
  },

});