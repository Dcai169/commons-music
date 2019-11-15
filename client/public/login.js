/**
 * The Sign-In client object.
 */
var auth2;

/**
 * Initializes the Sign-In client.
 */
function initClient() {
    gapi.load('auth2', function(){
        /**
         * Retrieve the singleton for the GoogleAuth library and set up the
         * client.
         */
        auth2 = gapi.auth2.init({
            client_id: '879508620239-iq626pk2vdu2jsgv70ri6vj8nbc9jufu.apps.googleusercontent.com',
            ux_mode: 'redirect'
        });

        // Attach the click handler to the sign-in button
        auth2.attachClickHandler('signin-button', {}, 
        /**
         * Handle successful sign-ins.
         */
        function(user) {
            console.log('Signed in as ' + user.getBasicProfile().getName());
         }, 
         /**
         * Handle sign-in failures.
         */
         function(error) {
            console.log(error);
        });
    });
};

function onSignIn(googleUser) {
    //   if (!signedIn && window.location.href !== "http://commonsmusic.ddns.net/auth_redirect"){
    //     window.location.href = "http://commonsmusic.ddns.net/auth_redirect"
    //   }
    var profile = googleUser.getBasicProfile();
    // console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
    // console.log('ID Token: '+ googleUser.getAuthResponse().id_token);
    // console.log('Name: ' + profile.getName());
    // console.log('Image URL: ' + profile.getImageUrl());
    console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
    // initClient();
    console.log(auth2);
}

function signOut() {
  var auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(function(){
    console.log("User signed out");
  });
}

