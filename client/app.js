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
const scopes = ['email', 'profile'];

const activeClients = [];

// is it lunchtime friday?
function isLunchFriday() {
    let time = new Date();
    let isFriday = (time.getDay() == 5);
    let isBeforeLunchStart = time.getHours() <= 11 && time.getMinutes() <= 44
    let isAfterLunchEnd = time.getHours() >= 13 && time.getMinutes() >= 12
    let isLunchHour = !isBeforeLunchStart && !isAfterLunchEnd;
    // return isFriday && isLunchHour;
    return true;
}

async function isDaemonReady(){
    io.emit('player-heartbeat');
    io.on('heartbeat-response', (data) => {
        return data;
    });
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
    if (req.user._json.hd){
        if (req.user._json.hd.includes("wayland.k12.ma.us")){
            return next();
        }
    } else {
        req.flash('error', 'Domain Error');
        return res.redirect('/logout');
    }

    req.flash('error', 'Session Expired');
    return res.redirect('/logout');
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

server.listen(httpPort, () => {
    console.log('Server running on port ' + httpPort)
    console.log('============')
})

app.get('/', continueIfUnauth, (req, res) => {
    res.render("home", {
        isAuth: req.isAuthenticated()
    });
});

app.get('/test', (req, res) => {
    res.render("test", {
        isAuth: req.isAuthenticated(),
        key: "req.user._json.sub",
        value: JSON.stringify(req.user._json.sub),
        type: typeof req.user._json.sub
    });
});

app.get('/about', (req, res) => {
    res.render("about", {
        isAuth: req.isAuthenticated()
    });
});

app.get('/dashboard', isOfDomain, continueIfAuth, (req, res) => {
    res.render("dashboard", {
        isAuth: req.isAuthenticated(),
        userID: req.user._json.sub,
        suggestSuccess: -1,
        skipActive: isLunchFriday()
    });                     
});

app.get('/login', continueIfUnauth, passport.authenticate('google', { scope: scopes }));

app.get('/denied', (req, res) => {
    res.render("denied");
});

app.get('/auth_redirect', 
    passport.authenticate('google', {
        successRedirect: '/dashboard',
        failureRedirect: '/login'
    }
));

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

app.get('/app/skips', (req, res) => {
    res.send(JSON.stringify(votesToSkip));
});

app.get('/app/suggestions', (req, res) => {
    res.send(JSON.stringify(suggestions));
});

app.get('/app/actives', (req, res) => {
    res.send(JSON.stringify(activeClients));
});

app.get('/debug', (req, res) => {
    res.render('debug');
});

io.on('connection', socket => {
    console.log(socket.id + ' connected');
    
    socket.on('disconnect', () => {
        console.log(socket.id + ' disconnected');
    });

    socket.on('suggest-text', (data) => {
        let regex = RegExp('/spotify:track:[a-z0-9]+$/i');
        if (regex.test(data)) {
            socket.emit('player-suggest', data);
        }
    });

    // Keep a list of UID's that have opted to skip
    // If a false is recieved remove that UID from the list
    // Skip when there are enough people on the list
    socket.on('skip', (data) => {        
        socket.emit('player-skip', data);
        console.log({'player-skip': data});
    });

    socket.on('event', (data) => {
        console.log('event\n', data);
    });

    socket.on('forward', (data) => {
        let cmd = JSON.parse(data);
        console.log({cmd});
        socket.emit(cmd[0], cmd[1]);
    });
});

// Add new routes before this line!
app.get('*', (req, res) => {
    res.status(404);
    res.render("404", {
        isAuth: req.isAuthenticated(),
        url: req.url
    });
});