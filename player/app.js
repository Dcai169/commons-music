const socket = require('socket.io-client')('commonsmusic.ddns.net');
const express = require('express');
const app = express();
const port = 2102;
const opn = require('opn');
const spotifyWebApi = require('spotify-web-api-node');
const fs = require('fs');
const credentials = JSON.parse(fs.readFileSync("credentials.json").toString().trim());

// Number of votes required to skip
const threshold = 1;
var votesToSkip = [];

const livePlaylistId = '7cuCPpXRCCvfOZSIWgAJ7p';
const suggestionPlaylistId = '';
var activeTrackIds;

var expiresAt;
var scopes = ['streaming', 'user-read-currently-playing', 'user-modify-playback-state', 'user-read-playback-state', "user-read-email", "user-read-private"];
var savedState = Math.random().toString(36).substring(2, 15);
var state;
var code;

// TODO:
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

function handleResponse(playlist){
  let tracks = playlist.tracks.items
  let trackIds = []
  for (track of tracks){
    trackIds.push(track.track.id)
    // console.log(track.track.name+": "+track.track.id)
  }
  return trackIds;
}

function pickRandItem(array){
    var randItem = array[Math.floor(Math.random() * array.length)];
    return randItem;
}

function isLunchFriday() {
    var time = new Date();
    var isLunchFriday = (time.getDay() == 5) && (!(time.getHours() <= 11 && time.getMinutes() <= 44) && !(time.getHours() >= 13 && time.getMinutes() >= 12));
    return isLunchFriday;
}

function activateShuffle(){
    spotifyApi.setShuffle({state: true}).then(
        function(data){
            console.log(data);
        },
        function(err){
            console.log('Something went wrong!', err);
        }
    );
}

function getLivePlaylist(){
    // Get tracks in playlist
    spotifyApi.getPlaylist(livePlaylistId).then(
        function(data) {
            return handleResponse(data.body);
        }, function(err) {
            console.log('Something went wrong!', err);
            return null;
        }
    );
}

function refreshToken(){
    // clientId, clientSecret and refreshToken has been set on the api object previous to this call.
    spotifyApi.refreshAccessToken().then(
        function(data) {
            console.log('The access token has been refreshed!');
            let now = new Date();
            expiresAt = new Date(now.getFullYear(), now.getMonth(), now.getDay(), now.getHours()+1, now.getMinutes(), now.getSeconds(), now.getMilliseconds());
            // Save the access token so that it's used in future calls
            spotifyApi.setAccessToken(data.body['access_token']);
        },
        function(err) {
            console.log('Could not refresh access token', err);
        }
    );
}

function skipTrack(){
    spotifyApi.skipToNext().then(
        function(data){
            // code
            return data;
        },
        function(err){
            console.log('Could not skip to next', err);
            return null;
        }
    );
}

function addSuggestion(suggestionId){
    spotifyApi.addTracksToPlaylist(suggestionPlaylistId, [suggestionId]).then(
        function(data){
            return data;
        },
        function(err){
            console.log('Could not add track', err);
            return null;
        }
    );
}

function getPlaybackState(){
    spotifyApi.getMyCurrentPlaybackState({}).then(
        function(data){
            return data;
        },
        function(err){
            console.log('Could not get playback state', err);
            return null;
        }
    )
}

function callWithRefreshCheck(fn, args){
    if (new Date().getTime() < expiresAt.getTime()){
        return fn(args);
    } else {
        refreshToken();
        return callWithRefreshCheck(fn, args);
    }
}

// credentials are optional
var spotifyApi = new spotifyWebApi({
    clientId: credentials.id,
    clientSecret: credentials.secret,
    redirectUri: 'http://localhost:2102/auth_redirect'
});

opn(spotifyApi.createAuthorizeURL(scopes, savedState), {app: 'firefox'});

// Socket.IO setup
socket.on('player-init', (data) => {
    callWithRefreshCheck(activateShuffle, null);
    activeTrackIds = callWithRefreshCheck(getLivePlaylist, null);
});

socket.on('player-heartbeat', (data) => {
    socket.emit('heartbeat-response', true);
});

socket.on('player-suggest', (data) => {
    // append to playlist using spotify web api
    callWithRefreshCheck(addSuggestion, data);
});

socket.on('player-skip', (data) => {
    let vote = JSON.parse(data);
    // if new vote caused skip, broadcast reset signal
    if(handleSkip(vote[0], vote[1])){
        socket.emit('track-skipped', true);
        callWithRefreshCheck(skipTrack, null);
    }
});

socket.on('player-meta-request', (data) => {
    socket.emit('player-meta-response', callWithRefreshCheck(getPlaybackState, null));
});

// Express routes
app.set('view engine', 'pug');
app.use(express.static(__dirname + "/public"));

app.get('/', (req, res) => {
    res.render('player', { accessToken: spotifyApi.getAccessToken() });
});

app.get('/auth_redirect', (req, res) => {
    code = req.query.code || null ;
    state = req.query.state || null;
    if (state === savedState && state !== null){
        spotifyApi.authorizationCodeGrant(code).then(
            function(data) {
                // console.log('The token expires in ' + data.body['expires_in']);
                // console.log('The access token is ' + data.body['access_token']);
                // console.log('The refresh token is ' + data.body['refresh_token']);
        
                // console.log(JSON.stringify(data));
        
                // Set the access token on the API object to use it in later calls
                spotifyApi.setAccessToken(data.body['access_token']);
                spotifyApi.setRefreshToken(data.body['refresh_token']);
                
                if (spotifyApi.getAccessToken()){
                    let now = new Date();
                    expiresAt = new Date(now.getFullYear(), now.getMonth(), now.getDay(), now.getHours()+1, now.getMinutes(), now.getSeconds(), now.getMilliseconds());
                    res.send('You may now close this window');
                    opn('http://localhost:2102/', { app: 'firefox' });
                } else {
                    res.send('Credential Error');
                }
            },
            function(err) {
                // console.log('The client ID is ' + spotifyApi.getClientId());
                // console.log('The client secret is ' + spotifyApi.getClientSecret());
                console.log(err);
                res.send(err);
            }
        );
    } else {
        res.send('State Error');
    }
});

// Debug routes
app.get('/debug/skip', (req, res) => {
    res.send(callWithRefreshCheck(skipTrack, null));
});

app.get('/debug/meta', (req, res) => {
    res.send(callWithRefreshCheck(getPlaybackState, null));
});

app.get('/debug/suggest', (req, res) => {
    res.send(callWithRefreshCheck(addSuggestion, req.query.s));
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

spotifyApi
