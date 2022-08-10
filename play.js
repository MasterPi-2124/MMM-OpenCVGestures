const { exec } = require('child_process');

const TOKEN     = 'BQDF2Rsszx5kWcPB2rIEXdr65RNLAihmaCV3g_DGNVopgI5qFMQYZNkVe4aXE8Qz2iXFm5JUQQ4MA2iF-N7cJHkjXd_s8mHuAPoClQoV31vetci7g2ZI5i6B_v8LdqtRbQWI-Fa5tq0nNjaEZXZZDf0an0SnpC0Btl_NGYfEH0PkiBf5W_jOLyIKM-_FXIJae80NCgI';
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
var pre_repeat_state = "track";
var cur_shuffer_state = true;
var cur_repeat_state = "off";

var cmd = 'spotify';

function generateCmdString(method, url, token, state) {
  if(state.localeCompare('off') == 0 || state.localeCompare('track') == 0 || state.localeCompare('true') == 0 || state.localeCompare('false') == 0 || state.localeCompare('context') == 0) {
    return ('curl -X "' + method +'" "' + url + '?device_id=' + DEVICE_ID + '&state=' + state + '" -H "Accept: application/json" -H "Content-Type: application/json" -H "Authorization: Bearer ' + token + '"');
  }
  return ('curl -X "' + method +'" "' + url + '?device_id=' + DEVICE_ID + '" -H "Accept: application/json" -H "Content-Type: application/json" -H "Authorization: Bearer ' + token + '"');
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

if(pre_repeat_state.localeCompare('off') == 0) {
    cur_repeat_state = 'track';
  } else {
    cur_repeat_state = 'off'
  }
  cmd = generateCmdString(METHOD_PUT, SPOTIFY_REPEAT, TOKEN, cur_repeat_state);
  pre_repeat_state = cur_repeat_state;
console.log(cmd);
spotify_api_func(cmd);