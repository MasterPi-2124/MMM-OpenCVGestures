const NodeHelper = require("node_helper");
const Log = require("logger");
const { spawn } = require('child_process');

module.exports = NodeHelper.create({
  start: function() {
    console.log("[OP]: node_helper.js started.");
    this.monitorOn = true;    
    this.turnOffTimer = undefined;
  },

  socketNotificationReceived: function(notification, payload) {
		if (notification === "HELLO_FROM_CLIENT_WITH_CONFIG") {
			console.log("[OP]: Hello from client to initiate notification socket: ", notification);
      this.config = payload;
      this.getCore();
		}
	},

  sleep: function() {
    var self = this;
    if(self.turnOffTimer){
      console.log('[OP]: removing save energy timer');
      clearTimeout(self.turnOffTimer);
    }
    var exec = require('child_process').exec;
    exec('vcgencmd display_power 1', function(error, stdout, stderr) {
      if (error !== null) {
        console.log(new Date() + ': exec error: ' + error);
      } else {
    
        process.stdout.write(new Date() + ': Turned monitor on.\n');
        self.hdmiOn = true;
      }
    });
  },

  getCore: function() {
    var self = this;
    let delayTime = this.config.delayTime;
    let gpio = this.config.GPIO;
    console.log("[OP]: delayTime = ", delayTime);
    const log = spawn('python3', ['modules/MMM-OpenCVGestures/predict.py', delayTime, gpio]);
    console.log("[OP]: Core spawned!")
    log.stdout.on('data', function(data) {
      message = data.toString();
      console.log("[OP]: ", message);

      if (message === "MODULE_HELLO") {
        self.sendSocketNotification("OpenCV module started!");
      } else if (message === "MODULE_LOADED") {
        self.sendSocketNotification("OpenCV module loaded! This module will be hidden until a motion nearby is detected.");
      } else if (message === "MOTION_DETECTED") {
        self.sendSocketNotification("Motion detected! Waiting for 3s before capturing...");
      } else if (message === "PICTURE_CAPTURED") {
        self.sendSocketNotification("Processing...");
      } else if (message === "PROCESS_OK_1") {
        self.sendSocketNotification("Gesture ☝ detected!");
      } else if (message === "PROCESS_OK_L") {
        self.sendSocketNotification("Gesture L detected!");
      } else if (message === "PROCESS_OK_NOGESTURE") {
        self.sendSocketNotification("No gestures detected!");
      } else if (message === "PROCESS_OK_PAPER") {
        self.sendSocketNotification("Gesture 🖐️ detected!");
      } else if (message === "PROCESS_OK_ROCK") {
        self.sendSocketNotification("Gesture ✊ detected!");
      } else if (message === "PROCESS_OK_SCISSOR") {
        self.sendSocketNotification("Gesture ✌️ detected!");
      } else if (message === "PROCESS_OK_U") {
        self.sendSocketNotification("Gesture 🤏🏻 detected!");
      } else if (message === "MOTION_NOT_DETECTED") {
        self.sendSocketNotification("Motion not detected, module will be hidden.")
      }
    })
  },

})
