Module.register("MMM-OpenCVGestures", {
  // Default module config.
  defaults: {
    message: "This is MMM-OpenCVGestures!",
    fadeInterval: 500,
    delayTime: 3, // Delay time for mirror between dectecting motions and taking pictures
    customCommand: {},
    hidden: false,
    GPIO: 14, // GPIO Pin of PIR sensor
    standbyTime: 6000,
  },

  getStyles: function () {
		return ["MMM-OpenCVGestures.css"];
	},

	start: function () {
		Log.info('[OP]: MMM-OpenCVGestures start invoked.');
    // this.checkCompatibility();
    this.sendSocketNotification("HELLO_FROM_CLIENT_WITH_CONFIG", this.config);
	},

  // checkCompatibility: function () {
  //   let onlyHas = [];
  //   navigator.mediaDevices.getUserMedia({
  //     video: true,
  //     audio: true
  //   });

  //   navigator.mediaDevices.enumerateDevices()
  //   .then(devices => {
  //     let video = audio = false;
  //     devices.forEach(device => {
  //       console.log("[OP]: ", device.kind)
  //       if (device.kind == "audioinput") {
  //         onlyHas.push(device.kind);
  //         audio = true;
  //       } else if (device.kind == "videoinput") {
  //         onlyHas.push(device.kind);
  //         video = true;
  //       }
  //     });
      
  //     if (video == true && audio == true) {
  //       this.config.message = "all devices OK";
  //       console.log("[OP]: ", this.config.message);
  //       this.updateDom(this.config.fadeInterval);
  //     } else {
  //       console.log("[OP]: ", onlyHas);
  //       this.config.message = "all devices not OK";
  //       console.log("[OP]: ", this.config.message);
  //       this.updateDom(this.config.fadeInterval);
  //     }
  //   })
  //   .catch(function(err) {
  //     console.log("[OP]: ", err.name + ": " + err.message);
  //   });
  // },

  // Override dom generator.
  getDom() {
    var wrapper = document.createElement("div");
    wrapper.className = "wrapper thin bright pre-line";
    wrapper.innerHTML = this.config.message;
    return wrapper;
  },

  socketNotificationReceived(notification, payload) {
    this.config.message = notification;
    console.log("[OP]: ", notification);
    this.updateDom(this.config.fadeInterval);
  },
});