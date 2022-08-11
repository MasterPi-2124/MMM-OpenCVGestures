const NodeHelper = require("node_helper");
const Log = require("logger");
const { spawn, exec } = require("child_process");
const fs = require("fs");
const Spotify = require("./spotify");
var request = require('request');

module.exports = NodeHelper.create({

  start: function () {
    console.log("[OP]: node_helper.js started.");
    this.monitorOn = true;
    this.turnOffTimer = undefined;
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "CLIENT_HELLO") {
      console.log(
        "[OP]: Hello from client to initiate notification socket: ",
        notification
      );
      this.config = payload;
      if (this.checkCompatibility() === true) {
        this.generateAccessToken();
        //this.getCore();
      }
    }
  },

  checkCompatibility: function () {
    if (fs.existsSync("/dev/video0")) {
      this.sendSocketNotification("CAMERA_OK", "Camera is ready!");
      return true;
    } else {
      this.sendSocketNotification(
        "CAMERA_NOT_OK",
        "Camera is not ready! Please check device again."
      );
      return false;
    }
  },

  generateAccessToken: function () {
    var self = this;

    const refresh_token  = 'AQB1taxC1SZ6cVySiwCIE9bQEtsqLOVoz9Ai90N_A20I6lBgEFhDp6Qkntn0prpysmHLHibQjU2fTw0kBf_Nyl_GKAGyWvGeCA9Npq1-IFibZhKcNlxgG4-ZMrlZPOfEiDw';
    // requesting access token from refresh token
    let result;
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      headers: { 'Authorization': 'Basic ' + (new Buffer(self.config.spotifyID + ':' + self.config.spotifySecret).toString('base64')) },
      form: {
        grant_type: 'refresh_token',
        refresh_token: refresh_token
      },
      json: true
    };
    console.log(authOptions);
    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        var access_token = body.access_token;
        result = access_token;
      }
    });
    console.log(result);
    return result;
  },

  getSpotify: function(command, isShuffle, isRepeat) {
    const REFRESH_TOKEN   = 'AQB1taxC1SZ6cVySiwCIE9bQEtsqLOVoz9Ai90N_A20I6lBgEFhDp6Qkntn0prpysmHLHibQjU2fTw0kBf_Nyl_GKAGyWvGeCA9Npq1-IFibZhKcNlxgG4-ZMrlZPOfEiDw';
    const DEVICE_ID       = '9f8afb577bcdb6041b6ac64d8a258a7f2682c24c';
    const SPOTIFY_PLAY    = 'https://api.spotify.com/v1/me/player/play';
    const SPOTIFY_PAUSE   = 'https://api.spotify.com/v1/me/player/pause';
    const SPOTIFY_NEXT    = 'https://api.spotify.com/v1/me/player/next';
    const SPOTIFY_BACK    = 'https://api.spotify.com/v1/me/player/previous';
    const SPOTIFY_REPEAT  = 'https://api.spotify.com/v1/me/player/repeat'
    const SPOTIFY_SHUFFER = 'https://api.spotify.com/v1/me/player/shuffle'
    const METHOD_PUT  = 'PUT';
    const METHOD_POST = 'POST';

    switch (command) {
      case "repeat":
        if (isRepeat === "off") {
          isRepeat = "track";
        } else isRepeat = "off";
        var cmd = Spotify.generateCmdString(METHOD_PUT, SPOTIFY_REPEAT, TOKEN, isRepeat);
        Spotify.spotify_api_func(cmd);
        break;
      case "shuffle":
        if (isShuffle === true) {
          isShuffle = false;
        } else isShuffle = true;
        var cmd = Spotify.generateCmdString(METHOD_PUT, SPOTIFY_SHUFFER, TOKEN, isShuffle);
        Spotify.spotify_api_func(cmd);
        break;
      case "pause":
        var cmd = Spotify.generateCmdString(METHOD_PUT, SPOTIFY_PAUSE, TOKEN);
        Spotify.spotify_api_func(cmd);
        break;
      case "play":
        var cmd = Spotify.generateCmdString(METHOD_PUT, SPOTIFY_PLAY, TOKEN);
        Spotify.spotify_api_func(cmd);
        break;
      case "previous":
        var cmd = Spotify.generateCmdString(METHOD_PUT, SPOTIFY_BACK, TOKEN);
        Spotify.spotify_api_func(cmd);
        break;
      case "next":
        var cmd = Spotify.generateCmdString(METHOD_PUT, SPOTIFY_NEXT, TOKEN);
        Spotify.spotify_api_func(cmd);
        break;
    }

  },

  triggerScreen: function (state) {
    var self = this;
    if (self.turnOffTimer) {
      console.log("[OP]: removing save energy timer");
      clearTimeout(self.turnOffTimer);
    }

    if (!self.monitorOn && state === "on") {
      exec("vcgencmd display_power 1", function (error, stdout, stderr) {
        if (error !== null) {
          console.log(new Date() + ": exec error: " + error);
        } else {
          process.stdout.write(new Date() + ": Turned monitor on.\n");
          self.monitorOn = true;
        }
      });
    } else if (self.monitorOn && state === "off") {
      self.turnOffTimer = setTimeout(function () {
        exec("vcgencmd display_power 0", function (error, stdout, stderr) {
          if (error !== null) {
            console.log(new Date() + ": exec error: " + error);
          } else {
            process.stdout.write(new Date() + ": Turned monitor off.\n");
            self.monitorOn = false;
          }
        });
      }, self.config.standbyTime);
    }
  },

  getCore: function () {
    var self = this;
    let delayTime = this.config.delayTime;
    let gpio = this.config.GPIO;

    const log = spawn("python3", [
      "modules/MMM-OpenCVGestures/predict.py",
      delayTime,
      gpio,
    ]);
    log.stdout.on("data", function (data) {
      message = data.toString();
      console.log("[OP]: ", message);
      message = "PROCESS_OK_PAPER";
      switch (message) {
        case "MODULE_HELLO":
          self.sendSocketNotification(message, "OpenCV module started!");
          break;
        case "MODULE_LOADED":
          self.sendSocketNotification(
            message,
            "OpenCV module loaded! This module will be hidden until a motion nearby is detected."
          );
          break;
        case "MOTION_DETECTED":
          self.triggerScreen("on");
          self.sendSocketNotification(
            message,
            "Motion detected! Waiting for 3s before capturing..."
          );
          break;
        case "PICTURE_CAPTURED":
          self.sendSocketNotification(message, "Processing...");
          break;
        case "PROCESS_OK_1":
          self.sendSocketNotification(message, "Gesture 1 detected!");
          Spotify();

          // Repeat spotify mode
          if(pre_repeat_state.localeCompare('off') == 0) {
            cur_repeat_state = 'track';
          } else {
            cur_repeat_state = 'off'
          }
          cmd = generateCmdString(METHOD_PUT, SPOTIFY_REPEAT, TOKEN, cur_repeat_state);
          pre_repeat_state = cur_repeat_state;

          break;
        case "PROCESS_OK_L":
          self.sendSocketNotification(message, "Gesture L detected!");
          // Shuffer spotify mode
          if(pre_shuffer_state == false) {
            cur_shuffer_state = true;
          } else {
            cur_shuffer_state = false;
          }
          cmd = generateCmdString(METHOD_PUT, SPOTIFY_SHUFFER, TOKEN, cur_shuffer_state.toString());
          pre_shuffer_state = cur_shuffer_state;
          break;
        case "PROCESS_OK_NOGESTURE":
          self.sendSocketNotification(message, "No gestures detected!");
          break;
        case "PROCESS_OK_PAPER":
          self.sendSocketNotification(message, "Gesture Paper detected!");
          // Play spotify
          cmd = generateCmdString(METHOD_PUT, SPOTIFY_PLAY, TOKEN);
          break;
        case "PROCESS_OK_ROCK":
          self.sendSocketNotification(message, "Gesture Rock detected!");
          // Pause spotify
          cmd = generateCmdString(METHOD_PUT, SPOTIFY_PAUSE, TOKEN);
          break;
        case "PROCESS_OK_SCISSOR":
          self.sendSocketNotification(message, "Gesture Scissor detected!");
          // previous song
          cmd = generateCmdString(METHOD_POST, SPOTIFY_BACK, TOKEN);
    
          break;
        case "PROCESS_OK_U":
          self.sendSocketNotification(message, "Gesture U detected!");
          // next song
          cmd = generateCmdString(METHOD_POST, SPOTIFY_NEXT, TOKEN);
          break;
        case "MOTION_NOT_DETECTED":
          self.sendSocketNotification(
            message,
            "Motion not detected, module will be hidden."
          );
          self.triggerScreen("off");
          break;
      }
      spotify_api_func(cmd);
      cmd = 'spotify';
    });
  },
});
