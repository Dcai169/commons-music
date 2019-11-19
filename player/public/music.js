const socket = io('http://localhost:2102');
let deviceId;

window.onSpotifyWebPlaybackSDKReady = () => {
    const token = document.getElementById('access-token').innerText;
    const player = new Spotify.Player({
      name: 'Commons Music',
      getOAuthToken: cb => { cb(token); }
    });

    // Error handling
    player.addListener('initialization_error', ({ message }) => { console.error(message); });
    player.addListener('authentication_error', ({ message }) => { console.error(message); });
    player.addListener('account_error', ({ message }) => { console.error(message); });
    player.addListener('playback_error', ({ message }) => { console.error(message); });

    // Playback status updates
    player.addListener('player_state_changed', state => { console.log(state); });

    // Ready
    player.addListener('ready', ({ device_id }) => {
      deviceId = device_id;
      console.log('Ready with Device ID', device_id);
    });

    // Not Ready
    player.addListener('not_ready', ({ device_id }) => {
      deviceId = null;
      console.log('Device ID has gone offline', device_id);
    });

    // Connect to the player!
    player.connect().then(
        function(data){
            setTimeout(() => {
                console.log('player ready');
                socket.emit('player-init', deviceId);
            }, 3000);
        },
        function(err){
            console.log(err);
        }
    );
};

socket.on('player-init', (data) => {
    console.log('player-init recieved\n', data);
});

socket.on('track-skipped', (data) => {
    console.log('Track skipped recieved\n', data);
});