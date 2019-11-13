const express = require('express');
const app = express();
const port = 2100;
const bodyParser = require("body-parser")

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

app.get('/login', (req, res) => {
    res.render("login");
});

app.get('/denied', (req, res) => {
    res.render("denied");
});

app.post('/dashboard', (req, res) => {
    console.log(req.body)
    res.render("dashboard", {
        suggestSuccess: 1,
        skipActive: isLunchFriday()
    });
});
