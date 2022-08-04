const NodeHelper = require("node_helper");
const Log = require("logger");
const { spawn } = require('child_process');

module.exports = NodeHelper.create({
  start: function() {
    console.log("[OP]: node_helper.js started.");
    this.run();
  },

  run: function() {
    console.log("[OP]: go to run!")
    const log = spawn('python3', ['modules/MMM-OpenCVGestures/predict.py']);
    console.log("[OP]: spawned!")
    log.stdout.on('data', function(data) {
      message = data.toString();
      console.log("[OP]: ", message);
      if (message === "FILE_REACHED") {
        this.sendSocketNotification("python file reached!");
      } else if (message === "MODULE_HELLO") {
        this.sendSocketNotification("OpenCV module started!");
      } else if (message === "MODULE_LOADED") {
        this.sendSocketNotification("OpenCV module loaded!");
      } else if (message === "MOTION_DETECTED") {
        this.sendSocketNotification("Motion detected! Pause for 3second before capturing.");
      } else if (message === "PICTURE_CAPTURED") {
        this.sendSocketNotification("Picture captured and saved!");
      } else if (message === "PROCESS_OK_1") {
        this.sendSocketNotification("Result: 1");
      } else if (message === "PROCESS_OK_L") {
        this.sendSocketNotification("Result: L");
      } else if (message === "PROCESS_OK_NOGESTURE") {
        this.sendSocketNotification("Result: NOGESTURE");
      } else if (message === "PROCESS_OK_PAPER") {
        this.sendSocketNotification("Result: PAPER");
      } else if (message === "PROCESS_OK_ROCK") {
        this.sendSocketNotification("Result: ROCK");
      } else if (message === "PROCESS_OK_SCISSOR") {
        this.sendSocketNotification("Result: SCISSOR");
      } else if (message === "PROCESS_OK_U") {
        this.sendSocketNotification("Result: U");
      } else if (message === "MOTION_NOT_DETECTED") {
        this.sendSocketNotification("Motion not detected, module will go to sleep.")
      }
    })
  },

  socketNotificationReceived: function(notification, payload) {
    Log.log(notification);
  },


})