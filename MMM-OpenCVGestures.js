Module.register("MMM-OpenCVGestures", {
  // Default module config.
  defaults: {
    message: "This is MMM-OpenCVGestures!",
    fadeInterval: 500,
    delayTime: 3, // Delay time for mirror between dectecting motions and taking pictures
    customCommand: {},
    hidden: false,
    GPIO: -1, // GPIO Pin of PIR sensor
    standbyTime: 10 * 1000, // default duration time before screen off
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
    } else if (this.checkCompatibility() === false) {
      this.config.message = "Input devices are not ready! Please check devices again.";
      this.updateDom(this.config.fadeInterval);
      this.toggleHide(true);
    } else {
      this.config.message = "Input devices are ready!";
      this.updateDom(this.config.fadeInterval);
      this.sendSocketNotification("HELLO_FROM_CLIENT_WITH_CONFIG", this.config);
    }
  },

  checkCompatibility: function () {
    let onlyHas = [];
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        let audio = video = false;
        devices.forEach((device) => {
          console.log("[OP]: ", device.kind);
          if (device.kind == "audioinput") {
            onlyHas.push(device.kind);
            audio = true;
          }
        });

        let fso = new ActiveXObject("Scripting.FileSystemObject");
        if (fso.FolderExists("/dev/video0")) {
          video = true;
          onlyHas.push("videoinput");
        }

        if (video === true && audio === true) {
          return true;
        } else {
          return false;
        }
      })
      .catch(function (err) {
        console.log("[OP]: ", err.name + ": " + err.message);
      });
  },

  toggleHide: function (state) {
    console.log("[OP]: ", this.name);
    thisModule = MM.getModules().withClass(this.name);
    if (thisModule && thisModule.length === 1) {
      console.log("[OP]: MMM-OpenCVGestures hidden.");
      var module = thisModule[0];
      if (state === true) {
        module.hide(this.config.fadeInterval);
      } else {
        module.show(this.config.fadeInterval);
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
    if (
      notification === "MODULE_LOADED" ||
      notification === "MOTION_NOT_DETECTED"
    ) {
      setTimeout(function () {
        self.toggleHide(true);
      }, 3000);
    }
  },
});
