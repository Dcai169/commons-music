// var urlParams = new URLSearchParams(window.location.search);
var SpotifyWebApi = require('spotify-web-api-node');
const fs = require('fs');

var client_credentials = JSON.parse(fs.readFileSync("spotify_credentials.json").toString().trim());
var id = client_credentials.id
var secret = client_credentials.secret

var scopes = ["streaming", "user-read-email", "user-read-private"];
var scopes = ['streaming', 'user-read-currently-playing', 'user-modify-playback-state', 'user-read-playback-state']
var state = 'none'

// // credentials are optional
var spotifyApi = new SpotifyWebApi({
  clientId: id,
  clientSecret: secret,
  redirectUri: 'http://example.com'
});

var authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);
console.log(authorizeURL)
console.log()

// // RETRIEVE AN ACCESS TOKEN.
// spotifyApi.clientCredentialsGrant().then(
//   function(data) {
//     // console.log('The access token expires in ' + data.body['expires_in']);
//     // console.log('The access token is ' + data.body['access_token']);

//     // Save the access token so that it's used in future calls
//     spotifyApi.setAccessToken(data.body['access_token']);

//     // GET DAT DATA BOII
//     spotifyApi.getPlaylist('7cuCPpXRCCvfOZSIWgAJ7p')
//     .then(function(data) {
//       // console.log('Some information about this playlist:\n', data.body);
//       handle_response(data.body);
//     }, function(err) {
//       console.log('Something went wrong!', err);
//     });
//   },
//   function(err) {
//     console.log('The client ID is ' + spotifyApi.getClientId());
//     console.log('The client secret is ' + spotifyApi.getClientSecret());
//     console.log('Something went wrong when retrieving an access token', err);
//   }
// );

// function handle_response(playlist){
//   var list_tracks = playlist.tracks.items
//   var track_ids = []
//   for (track of list_tracks){
//     track_ids.push(track.track.id)
//     // console.log(track.track.name+": "+track.track.id)
//   }
//   console.log(track_ids)
//   var rand = myArray[Math.floor(Math.random() * myArray.length)];
//   console.log(rand)
// }

// var code, state;

// if (urlParams.has('code')){
//   code = urlParams.get('code');
// }

// if (urlParams.has('state')){
//   state = urlParams.get('state');
// }

// window.onSpotifyWebPlaybackSDKReady = () => {
//   // const token = 'AQAYzZZJ-RS7piYOMiQ3leoPIlkn3xz_HF1cdaQXyyNOYJ1dIu0LEmifU23T9DytisExUHYE-WjCg9SiPrgNAHtVPWlzHnlq0-gTNbelEZ6sHUz6f3DonMakzHQSn4HzHoZBUzOlM3dS0_9JIq54Ses6sWsj3hBAn_LlYy30eTKpHIKyXUYS9BPnqBBkWeSePe21DWI9C7-9r9lryRK8eokt997uyb_V0ajWEgq6Vyw_rtMf-9S88vzZFK-jKx6AeDv7nBQNp9fSKF-vb-jMXK_8LajUKRYXvcLRsYzYp0bRdyc9twBfmow09j2XVz5Q8Laq86_u1z8';
//   const player = new Spotify.Player({
//     name: 'WHS Commons Music',
//     getOAuthToken: cb => { cb(code); }
//   });

//   // Error handling
//   player.addListener('initialization_error', ({ message }) => { console.error(message); });
//   player.addListener('authentication_error', ({ message }) => { console.error(message); });
//   player.addListener('account_error', ({ message }) => { console.error(message); });
//   player.addListener('playback_error', ({ message }) => { console.error(message); });

//   // Playback status updates
//   player.addListener('player_state_changed', state => { console.log(state); });
//   player.addListener('player_state_changed', state => { set_album_cover(state); });

//   // Ready
//   player.addListener('ready', ({ device_id }) => {
//     console.log('Ready with Device ID', device_id);
//   });

//   // Not Ready
//   player.addListener('not_ready', ({ device_id }) => {
//     console.log('Device ID has gone offline', device_id);
//   });

//   // Connect to the player!
//   player.connect();
// };