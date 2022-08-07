Module.register("MMM-OpenCVGestures", {
  // Default module config.
  defaults: {
    message: "This is MMM-OpenCVGestures!",
    fadeInterval: 500,
    delayTime: 3, // Delay time for mirror between dectecting motions and taking pictures
    customCommand: {},
    hidden: false,
    GPIO: -1, // GPIO Pin of PIR sensor
    standbyTime: 300 * 1000, // default duration time before screen off
  },

  getStyles: function () {
    return ["MMM-OpenCVGestures.css"];
  },

  start: function () {
    console.log("[OP]: MMM-OpenCVGestures start invoked.");
    if (this.config.GPIO === -1) {
      this.config.message = "MMM-OpenCVGestures GPIO param is misconfigured!";
      this.updateDom(this.config.fadeInterval);
      this.toggleHide(true);
    } else {
      this.sendSocketNotification("CLIENT_HELLO", this.config);
    }
  },

  toggleHide: function (state) {
    thisModule = MM.getModules().withClass(this.name);
    if (thisModule && thisModule.length === 1) {
      var module = thisModule[0];
      console.log(this.config.hidden);
      if (state === true && this.config.hidden === false) {
        console.log("[OP]: MMM-OpenCVGestures hidden.");
        module.hide(this.config.fadeInterval);
        this.config.hidden = true;
      } else if (state === false && this.config.hidden === true) {
        console.log("[OP]: MMM-OpenCVGestures shown.");
        module.show(this.config.fadeInterval);
        this.config.hidden = false;
    }
    }
  },

  // Override dom generator.
  getDom() {
    var wrapper = document.createElement("div");
    wrapper.className = "wrapper thin bright pre-line";
    wrapper.innerHTML = this.config.message;
    return wrapper;
  },

  socketNotificationReceived(notification, payload) {
    var self = this;
    this.config.message = payload;
    console.log("[OP]: ", notification);
    if (notification === "MOTION_DETECTED") {
      this.toggleHide(false);
    }
    this.updateDom(this.config.fadeInterval);
    if ( notification === "MODULE_LOADED" || notification === "MOTION_NOT_DETECTED") {
      setTimeout(function () {
        self.toggleHide(true);
      }, 3000);
    }
  },
});
