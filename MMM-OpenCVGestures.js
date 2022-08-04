Module.register("MMM-OpenCVGestures", {

  // Default module config.
  defaults: {
    message: "Hello World!",
  },

	start: function () {
		Log.info('MMM-OpenCVGestures start invoked.');
    this.checkCompatibility();
    this.sendSocketNotification("HELLO_FROM_CLIENT")
	},

  checkCompatibility: function () {
    let onlyHas = [];
    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });

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
    .catch(function(err) {
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
    console.log("[OP]: ", notification);
    this.updateDom();
  },
});