const fs = require('fs');
const express = require('express');
const app = express();

app.set('view engine', 'pug');

const server = app.listen(1687, () => {
    console.log(`Express running → PORT ${server.address().port}`);
});

app.get('/', (req, res) => {
    res.send(fs.readFileSync("server_index.html").toString().trim());
    // console.log(req.query);
});

app.get('/login', (req, res) => {
    res.send(fs.readFileSync("server_index.html").toString().trim());
    // console.log(req.query);
});

app.get('/player', (req, res) => {
    res.render('player');
    console.log(req.query);
});