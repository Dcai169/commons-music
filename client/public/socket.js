const socket = io();
const suggestForm = document.getElementById('suggest-form');
const suggestInput = document.getElementById('suggest-input');
const skipForm = document.getElementById('skip-form');
const threshold = 15;

socket.on('button-reset', (data) => {
    // reset button state to false
    setButtonState(false);
});

socket.on('current-track', (data) => {
    e.preventDefault();
    socket.emit('suggest-text', suggestInput.value);
    suggestInput.value = "";
});

socket.on('vote-length', (data) => {
    let votesToGo = threshold - data;
    let string = `${votesToGo} votes left to skip`
    document.getElementById('votes-remaining').innerHTML = string;
});

skipForm.addEventListener('click', e => {
    e.preventDefault();
    socket.emit('skip', JSON.stringify([document.getElementById('user-id').innerHTML, !getButtonState()]));
});

socket.on('dashboard-update', (data) => {
    let state = JSON.parse(data);
    console.log('player update')
    setTrackDetails(
        state['track_window']['current_track']['album']['images'][2]['url'], 
        state['track_window']['current_track']['name'],
        state['track_window']['current_track']['artists']
    );
});
