const { exec, spawn } = require('child_process');
var request = require('request'); // "Request" library
var querystring = require('querystring');
const fs = require("fs");

var client_id = '1f9d636a52774c4495c1b51aab29b732'; // Your client id
var client_secret = '5fbcdbd89dd247529b709d8ccf360ea1'; // Your secret

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

var cmd = 'spotify';
var pre_shuffer_state = false;
var pre_repeat_state = "track";
var cur_shuffer_state = true;
var cur_repeat_state = "off";

var cmd   = 'spotify';
var token = 'token';

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


function generateCmdString(method, url, token, state) {
  if (typeof state === 'undefined') {
    return ('curl -X "' + method +'" "' + url + '?device_id=' + DEVICE_ID + '" -H "Accept: application/json" -H "Content-Type: application/json" -H "Authorization: Bearer ' + token + '"');
  }
    return ('curl -X "' + method +'" "' + url + '?device_id=' + DEVICE_ID + '&state=' + state + '" -H "Accept: application/json" -H "Content-Type: application/json" -H "Authorization: Bearer ' + token + '"');
}

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


generateAccessToken(REFRESH_TOKEN, function(token) {
    cmd = generateCmdString(METHOD_PUT, SPOTIFY_PLAY, token);
    console.log(cmd);
    spotify_api_func(cmd);
});
