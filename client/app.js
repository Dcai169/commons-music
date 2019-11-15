const express = require('express');
const app = express();
const port = 2100;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const session = require("express-session")

function isLunchFriday() {
    var time = new Date();
    var isFriday = (time.getDay() == 5);
    var isLunchHour = ((time.getHours() >= 11 && time.getMinutes() >= 44) && (time.getHours() <= 13 && time.getMinutes() <= 12));
    return isFriday && isLunchHour;
    // return true;
}

app.set('view engine', 'pug');
app.use(express.static(__dirname+"/public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(session({secret: 'superSecret', saveUninitialized: false, resave: false, cookie: {maxAge: 3600000}}))

app.listen(port, () => {
    console.log('Express running on port ' + port);
});

app.get('/', (req, res) => {
    res.render("home", {
        isAuthed: false
    });
});

app.get('/lorem', (req, res) => {
    res.render("lorem", {
        isAuthed: false
    });
});

app.get('/test', (req, res) => {
    res.render("test", {
        isAuthed: false
    });
});

app.get('/about', (req, res) => {
    res.render("about", {
        isAuthed: false
    });
});

app.get('/dashboard', (req, res) => {
    res.render("dashboard", {
        isAuthed: false,
        suggestSuccess: -1,
        skipActive: isLunchFriday()
    });
});

app.post('/dashboard', (req, res) => {
    console.log(req.body)
    res.render("dashboard", {
        isAuthed: false,
        suggestSuccess: 1,
        skipActive: isLunchFriday()
    });
});

app.get('/login', (req, res) => {
    res.render("login", {
        isAuthed: false
    });
});

app.get('/denied', (req, res) => {
    res.render("denied", {
        isAuthed: false
    });
});

app.get('/auth_redirect', (req, res) => {
    res.render("auth_redirect", {
        isAuthed: false
    });
});

app.get('/logout', (req, res) => {
    res.render("logout")
    res.session.isAuthed = false;
})

// Add new routes before this line!
app.get('*', (req, res) => {
    res.status(404);
    res.render("404", {
        url: req.url,
        isAuthed: false
    });
});