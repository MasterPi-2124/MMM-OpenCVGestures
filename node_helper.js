const NodeHelper = require("node_helper");
const Log = require("logger");
var request = require('request'); // "Request" library
const { spawn, exec } = require("child_process");
const fs = require("fs");


var client_id = '1f9d636a52774c4495c1b51aab29b732'; // Your client id
var client_secret = '5fbcdbd89dd247529b709d8ccf360ea1'; // Your secret

const TOKEN     = 'BQDg1jrdcILH_OvK0YUqSFFtSJ2S32LS_mswoN5v_d1O9C41VcUrdJN8qUZ0bW-ads4Q59FBeBCt-VKxI5BJurXWF4inGVuhCUiWz29QIR9tAyopObrAKVX1-zrMfQ_X_W8OUYMWzVX3EJCiTg_TroqxZLK_GRDoN9vxCQ3QwEIKw4D1L6voccZ4s81gkrZw7v_-hxA';
const DEVICE_ID = '9f8afb577bcdb6041b6ac64d8a258a7f2682c24c';

const SPOTIFY_PLAY    = 'https://api.spotify.com/v1/me/player/play';
const SPOTIFY_PAUSE   = 'https://api.spotify.com/v1/me/player/pause';
const SPOTIFY_NEXT    = 'https://api.spotify.com/v1/me/player/next';
const SPOTIFY_BACK    = 'https://api.spotify.com/v1/me/player/previous';
const SPOTIFY_REPEAT  = 'https://api.spotify.com/v1/me/player/repeat'
const SPOTIFY_SHUFFER = 'https://api.spotify.com/v1/me/player/shuffle'

const METHOD_PUT  = 'PUT';
const METHOD_POST = 'POST';

var cmd = 'spotify';
var pre_shuffer_state = false;
var pre_repeat_state = "off";
var cur_shuffer_state = false;
var cur_repeat_state = "off";
function generateCmdString(method, url, token, state) {
  if(state.localeCompare('off') == 0 || state.localeCompare('track') == 0 || state.localeCompare('true') == 0 || state.localeCompare('false') == 0 || state.localeCompare('context') == 0) {
    return ('curl -X "' + method +'" "' + url + '?device_id=' + DEVICE_ID + '&state=' + state + '" -H "Accept: application/json" -H "Content-Type: application/json" -H "Authorization: Bearer ' + token + '"');
  }
  return ('curl -X "' + method +'" "' + url + '?device_id=' + DEVICE_ID + '" -H "Accept: application/json" -H "Content-Type: application/json" -H "Authorization: Bearer ' + token + '"');
}

function generateAccessToken(refresh_token, callback) {

  // requesting access token from refresh token
  var refresh_token = refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };
  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      return callback(access_token);
    }
  });
};

function spotify_api_func(s) {
  if(s.localeCompare('spotify') == 0) return;
  exec((s), (error, stdout, stderr) => {
      if (error) {
        console.error(`error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
      }
      console.log(`stdout:\n${stdout}`);
    });
}

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
        this.getCore();
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
          self.sendSocketNotification(message, "Gesture ☝ detected!");
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
          self.sendSocketNotification(message, "Gesture ✋ detected!");
          // Play spotify
          cmd = generateCmdString(METHOD_PUT, SPOTIFY_PLAY, TOKEN);
          break;
        case "PROCESS_OK_ROCK":
          self.sendSocketNotification(message, "Gesture ✊ detected!");
          // Pause spotify
          cmd = generateCmdString(METHOD_PUT, SPOTIFY_PAUSE, TOKEN);
          break;
        case "PROCESS_OK_SCISSOR":
          self.sendSocketNotification(message, "Gesture ✌️ detected!");
          // previous song
          cmd = generateCmdString(METHOD_POST, SPOTIFY_BACK, TOKEN);
    
          break;
        case "PROCESS_OK_U":
          self.sendSocketNotification(message, "Gesture 🤘 detected!");
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
        case "LED_ON":
          self.sendSocketNotification(message, "LED is on!");
          break;
        case "LED_OFF":
          self.sendSocketNotification(message, "LED is off!");
          break;
      }
      spotify_api_func(cmd);
      cmd = 'spotify';
    });
  },
});
