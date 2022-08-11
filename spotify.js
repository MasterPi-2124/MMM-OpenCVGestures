const { exec } = require('child_process');
const fetch = require("fetch");

const Spotify = function() {
  let client_id = '1f9d636a52774c4495c1b51aab29b732'; // Your client id
  let client_secret = '5fbcdbd89dd247529b709d8ccf360ea1'; // Your secret
  let cmd = 'spotify';
  let pre_shuffer_state = false;
  let pre_repeat_state = "track";
  let cur_shuffer_state = true;
  let cur_repeat_state = "off";
  let token = 'token';
  
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

  const generateCmdString = (method, url, token, state) => {
    if(state.localeCompare('off') == 0 || state.localeCompare('track') == 0 || state.localeCompare('true') == 0 || state.localeCompare('false') == 0 || state.localeCompare('context') == 0) {
      return ('curl -X "' + method +'" "' + url + '?device_id=' + DEVICE_ID + '&state=' + state + '" -H "Accept: application/json" -H "Content-Type: application/json" -H "Authorization: Bearer ' + token + '"');
    }
    return ('curl -X "' + method +'" "' + url + '?device_id=' + DEVICE_ID + '" -H "Accept: application/json" -H "Content-Type: application/json" -H "Authorization: Bearer ' + token + '"');
  };

  const spotify_api_func = (spotify) => {
    if(spotify.localeCompare('spotify') == 0) return;
    exec((spotify), (error, stdout, stderr) => {
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
  };
}

module.exports = Spotify;