Module.register("MMM-OpenCVGestures", {
  // Default module config.
  defaults: {
    message: "This is MMM-OpenCVGestures!",
    fadeInterval: 500,
    delayTime: 3, // Delay time for mirror between dectecting motions and taking pictures
    customCommand: {},
    hidden: false,
    GPIO: -1, // GPIO Pin of PIR sensor
    standbyTime: 6000,
  },

  getStyles: function () {
    return ["MMM-OpenCVGestures.css"];
  },

  start: function () {
    Log.info("[OP]: MMM-OpenCVGestures start invoked.");
    if (this.config.GPIO === -1) {
      this.config.message = "MMM-OpenCVGestures GPIO param is misconfigured!";
      this.updateDom(this.config.fadeInterval);
    } else {
      this.sendSocketNotification("HELLO_FROM_CLIENT_WITH_CONFIG", this.config);
    }
  },

  toggleHide: function (state) {
    console.log("[OP]: ", this.name);
    thisModule = MM.getModules().withClass(this.name);
    if (thisModule && thisModule.length === 1) {
      console.log("[OP]: MMM-OpenCVGestures hidden.");
      var module = thisModule[0];
      if (state === true) {
        module.hide();
      } else {
        module.show();
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
    this.config.message = payload;
    console.log("[OP]: ", notification);
    if (message === "MOTION_DETECTED") {
      this.toggleHide(false);
    }
    this.updateDom(this.config.fadeInterval);
    if (message === "MODULE_LOADED" || message === "MOTION_NOT_DETECTED") {
      this.toggleHide(true);
    }
  },
});
