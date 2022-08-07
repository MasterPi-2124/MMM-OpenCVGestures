const NodeHelper = require("node_helper");
const Log = require("logger");
const { spawn, exec } = require('child_process');
const fs = require('fs');

module.exports = NodeHelper.create({
  start: function() {
    console.log("[OP]: node_helper.js started.");
    this.monitorOn = true;    
    this.turnOffTimer = undefined;
  },

  socketNotificationReceived: function(notification, payload) {
		if (notification === "CLIENT_HELLO") {
			console.log("[OP]: Hello from client to initiate notification socket: ", notification);
      this.config = payload;
      if (this.checkCompatibility() === true) {
        this.getCore();
      }
		}
	},

  checkCompatibility: function () {
    if (fs.existsSync("/dev/video0")) {
      this.sendSocketNotification("CAMERA_OK", "Camera is ready!");
      return true;
    } else {
      this.sendSocketNotification("CAMERA_NOT_OK", "Camera is not ready! Please check device again.");
      return false;
    }
  },

  triggerScreen: function(state) {
    var self = this;
    if(self.turnOffTimer){
      console.log('[OP]: removing save energy timer');
      clearTimeout(self.turnOffTimer);
    }

    if (!self.monitorOn && state === "on") {
      exec('vcgencmd display_power 1', function(error, stdout, stderr) {
        if (error !== null) {
          console.log(new Date() + ': exec error: ' + error);
        } else {
          process.stdout.write(new Date() + ': Turned monitor on.\n');
          self.monitorOn = true;
        }
      });
    } else if (self.monitorOn && state === "off") {
      self.turnOffTimer = setTimeout( function() {
  			exec('vcgencmd display_power 0', function(error, stdout, stderr) {
  				if (error !== null) {
  					console.log(new Date() + ': exec error: ' + error);
  				} else {
  					process.stdout.write(new Date() + ': Turned monitor off.\n');
  					self.monitorOn = false;
  				}
  			});
  		}, self.config.standbyTime);
    }
  },

  getCore: function() {
    var self = this;
    let delayTime = this.config.delayTime;
    let gpio = this.config.GPIO;

    const log = spawn('python3', ['modules/MMM-OpenCVGestures/predict.py', delayTime, gpio]);
    log.stdout.on('data', function(data) {
      message = data.toString();
      console.log("[OP]: ", message);
      switch (message) {
        case "MODULE_HELLO":
          self.sendSocketNotification(message, "OpenCV module started!");
          break;
        case "MODULE_LOADED":
          self.sendSocketNotification(message, "OpenCV module loaded! This module will be hidden until a motion nearby is detected.");
          break;
        case "MOTION_DETECTED":
          self.triggerScreen("on");
          self.sendSocketNotification(message, "Motion detected! Waiting for 3s before capturing...");
          break;
        case "PICTURE_CAPTURED":
          self.sendSocketNotification(message, "Processing...");
          break;
        case "PROCESS_OK_1":
          self.sendSocketNotification(message, "Gesture ☝ detected!");
          break;
        case "PROCESS_OK_L":
          self.sendSocketNotification(message, "Gesture L detected!");
          break;
        case "PROCESS_OK_NOGESTURE":
          self.sendSocketNotification(message, "No gestures detected!");
          break;
        case "PROCESS_OK_PAPER":
          self.sendSocketNotification(message, "Gesture ✋ detected!");
          break;
        case "PROCESS_OK_ROCK":
          self.sendSocketNotification(message, "Gesture ✊ detected!");
          break;
        case "PROCESS_OK_SCISSOR":
          self.sendSocketNotification(message, "Gesture ✌️ detected!");
          break;
        case "PROCESS_OK_U":
          self.sendSocketNotification(message, "Gesture 🤘 detected!");
          break;
        case "MOTION_NOT_DETECTED":
          self.sendSocketNotification(message, "Motion not detected, module will be hidden.");
          self.triggerScreen("off");
          break;
      }
    })
  },
})
