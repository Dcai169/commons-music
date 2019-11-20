const serverSocket = require('socket.io-client')('commonsmusic.ddns.net');
const express = require('express');
const app = express();
const port = 2102;
const server = require("http").createServer(app);
const io = require('socket.io')(server);
const schedule = require('node-schedule');
const opn = require('opn');
const spotifyWebApi = require('spotify-web-api-node');
const fs = require('fs');
const credentials = JSON.parse(fs.readFileSync("credentials.json").toString().trim());

// Number of votes required to skip
const threshold = 30;
let votesToSkip = [];

const activePlaylistId = 'spotify:playlist:7cuCPpXRCCvfOZSIWgAJ7p';
const suggestionPlaylistId = '';
let activeDeviceId;

let expiresAt;
let scopes = ['streaming', 'user-read-currently-playing', 'user-modify-playback-state', 'user-read-playback-state', "user-read-email", "user-read-private"];
let savedState = Math.random().toString(36).substring(2, 15);
let state;
let code;

let startJob;
let endJob;

// Function to remove array item by value
Array.prototype.remove = function() {
    let what, a = arguments, L = a.length, ax;
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

    console.log({votesToSkip});

    if (votesToSkip.length >= threshold){
        votesToSkip = [];
        return true;
    } else {
        return false;
    }
}

function isLunchFriday() {
    let time = new Date();
    let isLunchFriday = (time.getDay() == 5) && (!(time.getHours() <= 11 && time.getMinutes() <= 44) && !(time.getHours() >= 13 && time.getMinutes() >= 12));
    return isLunchFriday;
}

function activateShuffle(){
    spotifyApi.setShuffle({state: true}).then(
        function(data){
            console.log('Shuffle set to true');
        },
        function(err){
            console.log('Could not set shuffle state to true\n', err);
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
            console.log("Skip!")
        },
        function(err){
            console.log('Could not skip to next\n', err);
            return null;
        }
    );
}

function addSuggestion(suggestionId){
    if(!!suggestionId){
        spotifyApi.addTracksToPlaylist(suggestionPlaylistId, [suggestionId]).then(
            function(data){
                return data;
            },
            function(err){
                console.log('Could not add track', err);
                return null;
            }
        );
    } else {
        console.log({suggestionId});
    }
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

function transferToNewActiveDevice(newId){
    spotifyApi.transferMyPlayback({
        deviceIds: [activeDeviceId]
    }).then(
        function(data){
            console.log('Transfer Success\n'); // , data);
        },
        function(err){
            console.log(`Could not transfer playback to ID ${newId}\n`, err);
        }
    );
}

function callWithRefreshCheck(fn, args){
    if (expiresAt){
        if (new Date().getTime() > expiresAt.getTime()){
            return fn(args);
        } else {
            refreshToken();
            return fn(args)
        }
    } else {
        return false;
    }
}

function commencePlayback(){
    spotifyApi.play({ context_uri: activePlaylistId }).then(
        function(data){

        },
        function(err){
            console.log('Could not resume playback\n', err);
        }
    );
}

function haltPlayback(){
    spotifyApi.pause().then(
        function(data){
            console.log('Playback Paused')
            spotifyApi.seek(0).then(
                function(data){
                    console.log('Rewound to 0');
                },
                function(err){
                    console.log('Could not rewind to 0\n', err);
                }
            );
        },
        function(err){
            console.log('Could not stop playback\n', err);
        }
    );
}

function getMe(){
    spotifyApi.getMe().then(
        function(data){
            console.log(data);
        },
        function(err){
            console.log('Could not get me\n', err);
        }
    )
}

function start(){
    spotifyApi.transferMyPlayback({
        deviceIds: [activeDeviceId]
    }).then(
        function(data){
            console.log('Transfer Success\n'); // , data);
            spotifyApi.setShuffle({state: "true"}).then(                
                function(data){
                    console.log('Shuffle set to true');
                    spotifyApi.seek(0).then(
                        function(data){
                            console.log('Rewound to 0');
                        },
                        function(err){
                            console.log('Could not rewind to 0\n', err);
                        }
                    );
                },
                function(err){
                    console.log('Could not set shuffle state to true\n', err);
                }
            );
        },
        function(err){
            console.log(`Could not transfer playback to ID ${activeDeviceId}\n`, err);
        }
    );
}

// credentials are optional
let spotifyApi = new spotifyWebApi({
    clientId: credentials.id,
    clientSecret: credentials.secret,
    redirectUri: 'http://localhost:2102/auth_redirect'
});

opn(spotifyApi.createAuthorizeURL(scopes, savedState), {app: 'firefox'});

// Socket.IO setup
io.on('connection', (socket) => {
    socket.on('player-init', (data) => {
        if (!!data){
            console.log({'Device ID': data});
            activeDeviceId = data
            refreshToken();
            start();
        }
    });

    socket.on('player-skip', (data) => {
        let vote = JSON.parse(data);
        // if new vote caused skip, broadcast reset signal
        if(handleSkip(vote[0], vote[1])){
            serverSocket.emit('track-skipped', true);
            callWithRefreshCheck(skipTrack, null);
        }
    });

    socket.on('sudo-skip', (data) => {
        callWithRefreshCheck(skipTrack, null);
    });

    socket.on('sudo-resume', (data) => {
        callWithRefreshCheck(commencePlayback, null);
    });

    socket.on('sudo-stop', (data) => {
        callWithRefreshCheck(haltPlayback, null);
    });

    socket.on('sudo-init', (data) => {
        callWithRefreshCheck(setup, null);
    });
});

serverSocket.on('player-suggest', (data) => {
    // append to playlist using spotify web api
    callWithRefreshCheck(addSuggestion, data);
});

serverSocket.on('player-skip', (data) => {
    let vote = JSON.parse(data);
    // if new vote caused skip, broadcast reset signal
    if(handleSkip(vote[0], vote[1])){
        serverSocket.emit('track-skipped', true);
        callWithRefreshCheck(skipTrack, null);
    }
});

serverSocket.on('player-meta-request', (data) => {
    socket.emit('player-meta-response', callWithRefreshCheck(getPlaybackState, null));
});

// Express routes
app.set('view engine', 'pug');
app.use(express.static(__dirname + "/public"));

app.get('/', (req, res) => {
    res.render('player', { 
        accessToken: spotifyApi.getAccessToken()
    });
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
                    res.redirect('/');
                    let accessToken = spotifyApi.getAccessToken();
                    console.log({accessToken});
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

server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

startJob = schedule.scheduleJob('44 11 * * 5', commencePlayback);
endJob = schedule.scheduleJob('12 13 * * 5', haltPlayback);

// Test
// startJob = schedule.scheduleJob('51 8 * * 3', commencePlayback);
// endJob = schedule.scheduleJob('0 9 * * 3', haltPlayback);

// setTimeout(commencePlayback, 10000);
// setTimeout(getMe, 10000);