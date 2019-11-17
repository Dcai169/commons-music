const http = require('http');
const skipConfig = {
    hostname: 'commonsmusic.ddns.net',
    port: 80,
    path: '/app/skips',
    method: 'GET'
};
const suggestionsConfig = {
    hostname: 'commonsmusic.ddns.net',
    port: 80,
    path: '/app/suggestions',
    method: 'GET'
};
const activesConfig = {
    hostname: 'commonsmusic.ddns.net',
    port: 80,
    path: '/app/actives',
    method: 'GET'
};

function getSkips(){
    var req = http.request(skipConfig, (res) => {
        res.on('data', (data) => {
            return data;
        });

        res.on('error', (error) => {
            return error;
        });
    });
}

function getSuggestions(){
    var req = http.request(suggestionsConfig, (res) => {
        res.on('data', (data) => {
            return data;
        });

        res.on('error', (error) => {
            return error;
        });
    });
}

function getActives(){
    var req = http.request(activesConfig, (res) => {
        res.on('data', (data) => {
            return data;
        });

        res.on('error', (error) => {
            return error;
        });
    });
}

function isLunchFriday() {
    var time = new Date();
    var isFriday = (time.getDay() == 5);
    var isBeforeLunchStart = time.getHours() <= 11 && time.getMinutes() <= 44
    var isAfterLunchEnd = time.getHours() >= 13 && time.getMinutes() >= 12
    var isLunchHour = !isBeforeLunchStart && !isAfterLunchEnd;
    return isFriday && isLunchHour;
}