const express = require('express');
const app = express();
const httpPort = 2100;
const server = require("http").createServer(app);
const io = require('socket.io')(server);
// const socketPort = 2101;

const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const session = require("express-session");
const flash = require("express-flash");

const passport = require("passport");
const GoogleStratagy = require('passport-google-oauth20').Strategy;
const fs = require('fs');
const client_credentials = JSON.parse(fs.readFileSync('./client_secret.json', { encoding: 'utf-8' }));
var scopes = ['email', 'profile'];

function isLunchFriday() {
    var time = new Date();
    var isFriday = (time.getDay() == 5);
    var isBeforeLunchStart = time.getHours() <= 11 && time.getMinutes() <= 44
    var isAfterLunchEnd = time.getHours() >= 13 && time.getMinutes() >= 12
    var isLunchHour = !isBeforeLunchStart && !isAfterLunchEnd;
    // return isFriday && isLunchHour;
    return true;
}

// Middleware functions
function continueIfAuth(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }

    res.redirect('/login');
}

function continueIfUnauth(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/dashboard')
    }

    next();
}

function isOfDomain(req, res, next) {
    if (req.user){
        if (req.user.emails[0].value.split("@")[1].includes("wayland.k12.ma.us")){
            return next();
        }
    } else {
        req.flash('error', 'Session Expired');
        return res.redirect('/logout');
    }

    req.flash('error', 'Domain Error');
    res.redirect('/logout');
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
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    secret: 'superSecret', 
    saveUninitialized: false, 
    resave: false, 
    cookie: { maxAge: 1000*60*60*60*24*365 }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// app.listen(httpPort, () => {
//     console.log('Express running on port ' + httpPort);
// });

server.listen(httpPort, () => {
    console.log('Server running on port ' + httpPort)
    console.log('============')
})

app.get('/', continueIfUnauth, (req, res) => {
    res.render("home", {
        isAuth: req.isAuthenticated()
    });
});

// app.get('/lorem', (req, res) => {
//     res.render("lorem");
// });

app.get('/test', (req, res) => {
    res.render("test", {
        isAuth: req.isAuthenticated(),
        key: "req.user.emails[0].value",
        value: JSON.stringify(req.user.emails[0].value),
        type: typeof req.user.emails[0].value
    });
});

app.get('/about', (req, res) => {
    res.render("about", {
        isAuth: req.isAuthenticated()
    });
});

// TODO: Implement Domain Verification
app.get('/dashboard', isOfDomain, continueIfAuth, (req, res) => {
    res.render("dashboard", {
        isAuth: req.isAuthenticated(),
        suggestSuccess: -1,
        skipActive: isLunchFriday()
    });
});

// TODO: Implement Domain Verification
app.post('/dashboard', isOfDomain, continueIfAuth, (req, res) => {
    console.log(req.body)
    res.render("dashboard", {
        isAuth: req.isAuthenticated(),
        suggestSuccess: 1,
        skipActive: isLunchFriday()
    });
});

// app.get('/login', (req, res) => {
//     res.render("login");
// });

app.get('/login', continueIfUnauth, passport.authenticate('google', { scope: scopes }));

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

io.on('connection', socket => {
    console.log("new user connected")
    socket.emit('suggest-text', 'spotify:track:7Ghlk7Il098yCjg4BQjzvb');
    // socket.on('disconnect', () => {
    //     // code code code
    // });
    // socket.on('event', data => {
    //     // code code code
    // });
});

// Add new routes before this line!
app.get('*', (req, res) => {
    res.status(404);
    res.render("404", {
        isAuth: req.isAuthenticated(),
        url: req.url
    });
});