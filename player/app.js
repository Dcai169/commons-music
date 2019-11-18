const socket = require('socket.io-client')('commonsmusic.ddns.net');
// Number of votes required to skip
const threshold = 2;
// suggestions may not be needed
const suggestions = [];
var votesToSkip = [];

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
