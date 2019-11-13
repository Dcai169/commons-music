var signedIn = false;

function onSignIn(googleUser) {
  if (!signedIn){
    // window.location.href = "http://commonsmusic.ddns.net/auth_redirect"
  }
  // var profile = googleUser.getBasicProfile();
  // console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
  // console.log('ID Token: '+ googleUser.getAuthResponse().id_token);
  // console.log('Name: ' + profile.getName());
  // console.log('Image URL: ' + profile.getImageUrl());
  // console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
  signedIn = true;
  alert("onSignIn() called")
}

function signOut() {
  var auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(function(){
    console.log("User signed out");
  });
  signedIn = false;
}