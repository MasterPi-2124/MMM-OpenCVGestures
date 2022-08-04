const NodeHelper = require("node_helper");
const Log = require("logger");
const { spawn } = require('child_process');

module.exports = NodeHelper.create({
  start: function() {
    console.log("[OP]: node_helper.js started.");
    this.getCore();
  },

  socketNotificationReceived: function(notification, payload) {
		if (notification === "HELLO_FROM_CLIENT_WITH_CONFIG") {
			console.log("[OP]: Hello from client to initiate notification socket: ", notification);
      this.config = payload;
		}
	},

  getCore: function() {
    var self = this;
    let delayTime = this.config.delayTime;
    console.log("[OP]: delayTime = ", delayTime);
    const log = spawn('python3', ['modules/MMM-OpenCVGestures/predict.py', delayTime]);
    console.log("[OP]: Core spawned!")
    log.stdout.on('data', function(data) {
      message = data.toString();
      console.log("[OP]: ", message);

      if (message === "MODULE_HELLO") {
        self.sendSocketNotification("OpenCV module started!");
      } else if (message === "MODULE_LOADED") {
        self.sendSocketNotification("OpenCV module loaded!");
      } else if (message === "MOTION_DETECTED") {
        self.sendSocketNotification("Motion detected! Pause for 3second before capturing.");
      } else if (message === "PICTURE_CAPTURED") {
        self.sendSocketNotification("Picture captured and saved!");
      } else if (message === "PROCESS_OK_1") {
        self.sendSocketNotification("Result: 1");
      } else if (message === "PROCESS_OK_L") {
        self.sendSocketNotification("Result: L");
      } else if (message === "PROCESS_OK_NOGESTURE") {
        self.sendSocketNotification("Result: NOGESTURE");
      } else if (message === "PROCESS_OK_PAPER") {
        self.sendSocketNotification("Result: PAPER");
      } else if (message === "PROCESS_OK_ROCK") {
        self.sendSocketNotification("Result: ROCK");
      } else if (message === "PROCESS_OK_SCISSOR") {
        self.sendSocketNotification("Result: SCISSOR");
      } else if (message === "PROCESS_OK_U") {
        self.sendSocketNotification("Result: U");
      } else if (message === "MOTION_NOT_DETECTED") {
        self.sendSocketNotification("Motion not detected, module will go to sleep.")
      }
    })
  },

})