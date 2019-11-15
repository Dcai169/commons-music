const express = require('express');
const app = express();
const port = 2100;

const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const session = require("express-session")

const passport = require("passport");
const GoogleStratagy = require('passport-google-oauth20').Strategy;
const fs = require('fs');
const client_credentials = JSON.parse(fs.readFileSync('./client_secret.json', {encoding: 'utf-8'}));
var scopes = ['email', 'profile'];

function isLunchFriday() {
    var time = new Date();
    var isFriday = (time.getDay() == 5);
    var isLunchHour = ((time.getHours() >= 11 && time.getMinutes() >= 44) && (time.getHours() <= 13 && time.getMinutes() <= 12));
    return isFriday && isLunchHour;
    // return true;
}

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Google profile is
//   serialized and deserialized.
passport.serializeUser(function(user, done) {
    done(null, user);
  });
  
  passport.deserializeUser(function(obj, done) {
    done(null, obj);
  });

passport.use(new GoogleStratagy({
        clientID: client_credentials.web.client_id,
        clientSecret: client_credentials.web.client_secret,
        callbackURL: client_credentials.web.redirect_uris[0],
        passReqToCallback: true
    },
    function(request, accessToken, refreshToken, profile, done){
        // User.findOrCreate({googleID: profile.id}, function(err, user) {
        //     return done(err, user);
        // });

        // asynchronous verification, for effect...
        process.nextTick(function () {
        
            // To keep the example simple, the user's Google profile is returned to
            // represent the logged-in user.  In a typical application, you would want
            // to associate the Google account with a user record in your database,
            // and return that user instead.
            return done(null, profile);
        });
    }
));

app.set('view engine', 'pug');
app.use(express.static(__dirname+"/public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(session({
    secret: 'superSecret', 
    saveUninitialized: false, 
    resave: false, 
    cookie: {maxAge: 3600000}
}));
app.use(passport.initialize());
app.use(passport.session());

app.listen(port, () => {
    console.log('Express running on port ' + port);
});

app.get('/', (req, res) => {
    res.render("home");
});

app.get('/lorem', (req, res) => {
    res.render("lorem");
});

app.get('/test', (req, res) => {
    res.render("test");
});

app.get('/about', (req, res) => {
    res.render("about");
});

app.get('/dashboard', (req, res) => {
    res.render("dashboard", {
        suggestSuccess: -1,
        skipActive: isLunchFriday()
    });
});

app.post('/dashboard', (req, res) => {
    console.log(req.body)
    res.render("dashboard", {
        suggestSuccess: 1,
        skipActive: isLunchFriday()
    });
});

// app.get('/login', (req, res) => {
//     res.render("login");
// });

app.get('/login', passport.authenticate('google', {scope: scopes}));

app.get('/denied', (req, res) => {
    res.render("denied");
});

// app.get('/auth_redirect', (req, res) => {
//     res.render("auth_redirect");
// });

app.get('/auth_redirect', 
    passport.authenticate('google', {
        successRedirect: '/dashboard',
        failureRedirect: '/login'
    }
));

// app.get('/logout', (req, res) => {
//     res.render("logout");
// });

app.get('/logout', (req, res) => {
    // res.render("logout");
    req.logout();
    res.redirect('/');
});

// Add new routes before this line!
app.get('*', (req, res) => {
    res.status(404);
    res.render("404", {
        url: req.url,
    });
});