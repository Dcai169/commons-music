const express = require('express');
const app = express();
const port = 2100;

app.set('view engine', 'pug');
app.use(express.static(__dirname+"/public"));

app.listen(port, () => {
    console.log('Express running on port ' + port);
});

app.get('/', (req, res) => {
    res.render("default");
});

app.get('/lorem', (req, res) => {
    res.render("lorem")
});

app.get('/test', (req, res) => {
    res.render("test")
});