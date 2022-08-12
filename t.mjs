import got from "got";

let isRepeat;
let isShuffle;
let accessToken;
let isActive = false;
const DEVICE_ID = "9f8afb577bcdb6041b6ac64d8a258a7f2682c24c";

const getAccessToken = async () => {
  const refresh_token =
    "AQB1taxC1SZ6cVySiwCIE9bQEtsqLOVoz9Ai90N_A20I6lBgEFhDp6Qkntn0prpysmHLHibQjU2fTw0kBf_Nyl_GKAGyWvGeCA9Npq1-IFibZhKcNlxgG4-ZMrlZPOfEiDw";
  // requesting access token from refresh token
  var authOptions = {
    headers: {
      Authorization:
        "Basic " +
        new Buffer.from(
          "1f9d636a52774c4495c1b51aab29b732" +
            ":" +
            "5fbcdbd89dd247529b709d8ccf360ea1"
        ).toString("base64"),
    },
    form: {
      grant_type: "refresh_token",
      refresh_token: refresh_token,
    },
  };

  let res = await got
    .post("https://accounts.spotify.com/api/token", authOptions)
    .json()
    .catch((error) => {
      console.log(error.response.body);
    });
  let accessToken = res.access_token;
  console.log(accessToken);
  return accessToken;
};

const action = (command) => {
  if (isActive === false) {
    accessToken = getAccessToken();
    isActive = true;
  }
  switch (command) {
    case "repeat":
      if (isRepeat === "off") {
        isRepeat = "track";
      } else isRepeat = "off";
      var cmd =
        'curl -X "' +
        "PUT" +
        '" "' +
        "https://api.spotify.com/v1/me/player/repeat?device_id=" +
        DEVICE_ID +
        "&state=" +
        state +
        '" -H "Accept: application/json" -H "Content-Type: application/json" -H "Authorization: Bearer ' +
        accessToken +
        '"';
      spotify_api_func(cmd);
      break;
    case "shuffle":
      if (isShuffle === true) {
        isShuffle = false;
      } else isShuffle = true;
      var cmd =
        'curl -X "' +
        "PUT" +
        '" "' +
        "https://api.spotify.com/v1/me/player/shuffle?device_id=" +
        DEVICE_ID +
        "&state=" +
        state +
        '" -H "Accept: application/json" -H "Content-Type: application/json" -H "Authorization: Bearer ' +
        accessToken +
        '"';
      spotify_api_func(cmd);
      break;
    case "pause":
      var cmd =
        'curl -X "PUT" "' +
        "https://api.spotify.com/v1/me/player/pause?device_id=" +
        DEVICE_ID +
        '" -H "Accept: application/json" -H "Content-Type: application/json" -H "Authorization: Bearer ' +
        accessToken +
        '"';
      spotify_api_func(cmd);
      break;
    case "play":
      var cmd =
        'curl -X "PUT" "' +
        "https://api.spotify.com/v1/me/player/play?device_id=" +
        DEVICE_ID +
        '" -H "Accept: application/json" -H "Content-Type: application/json" -H "Authorization: Bearer ' +
        accessToken +
        '"';
      spotify_api_func(cmd);
      break;
    case "previous":
      var cmd =
        'curl -X "PUT" "' +
        "https://api.spotify.com/v1/me/player/previous?device_id=" +
        DEVICE_ID +
        '" -H "Accept: application/json" -H "Content-Type: application/json" -H "Authorization: Bearer ' +
        accessToken +
        '"';
      spotify_api_func(cmd);
      break;
    case "next":
      var cmd =
        'curl -X "PUT" "' +
        "https://api.spotify.com/v1/me/player/next?device_id=" +
        DEVICE_ID +
        '" -H "Accept: application/json" -H "Content-Type: application/json" -H "Authorization: Bearer ' +
        accessToken +
        '"';
      spotify_api_func(cmd);
      break;
  }
};

const spotify_api_func = (command) => {
  exec(command, (error, stdout, stderr) => {
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

action("shuffle");
