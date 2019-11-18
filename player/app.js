const socket = require('socket.io-client')('commonsmusic.ddns.net');
const spotifyWebApi = require('spotify-web-api-node');
const fs = require('fs');
const credentials = JSON.parse(fs.readFileSync("credentials.json").toString().trim());
// Number of votes required to skip
const threshold = 2;
// suggestions may not be needed
const suggestions = [];
var votesToSkip = [];

// TODO:
// Use the client credentials flow
// Get the credentials
// Set shuffle to true
// Start playing a randomly chosen song from playlist

// Function to remove array item by value
Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

function handleSkip(uid, vote) {
    if (!votesToSkip.includes(uid) && vote){
        votesToSkip.push(uid);
    } else if (!vote){
        votesToSkip.remove(uid);
    }

    if (votesToSkip.length > threshold){
        votesToSkip = [];
        return true;
    } else {
        return false;
    }
}

function isLunchFriday() {
    var time = new Date();
    var isLunchFriday = (time.getDay() == 5) && (!(time.getHours() <= 11 && time.getMinutes() <= 44) && !(time.getHours() >= 13 && time.getMinutes() >= 12));
    return isLunchFriday;
}

// credentials are optional
var spotifyApi = new spotifyWebApi({
    clientId: client.id,
    clientSecret: client.secret,
  });

spotifyApi.clientCredentialsGrant().then(
  function(data) {
    // console.log('The access token expires in ' + data.body['expires_in']);
    // console.log('The access token is ' + data.body['access_token']);

    console.log(JSON.stringify(data));

    // Save the access token so that it's used in future calls
    spotifyApi.setAccessToken(data.body['access_token']);

    // GET DAT DATA BOII
    spotifyApi.getPlaylist('7cuCPpXRCCvfOZSIWgAJ7p')
    .then(function(data) {
      // console.log('Some information about this playlist:\n', data.body);
      handle_response(data.body);
    }, function(err) {
      console.log('Something went wrong!', err);
    });
  },
  function(err) {
    console.log('The client ID is ' + spotifyApi.getClientId());
    console.log('The client secret is ' + spotifyApi.getClientSecret());
    console.log('Something went wrong when retrieving an access token', err);
  }
);

socket.on('player-heartbeat', (data) => {
    socket.emit('heartbeat-response', true);
});

socket.on('player-suggest', (data) => {
    // append to playlist using spotify web api
});

socket.on('player-skip', (data) => {
    let vote = JSON.parse(data);
    // if new vote caused skip, broadcast reset signal
    if(handleSkip(vote[0], vote[1])){
        socket.emit('track-skipped', true);
        // Skip the song using the spotify web api/playback sdk
    }
});

