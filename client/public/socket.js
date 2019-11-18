const socket = io();
const suggestForm = document.getElementById('suggest-form');
const suggestInput = document.getElementById('suggest-input');
const skipForm = document.getElementById('skip-form');

socket.on('track-skipped', data => {
    if (data) {
        // reset button state to false
        setButtonState(false);
    }
});

suggestForm.addEventListener('submit', e => {
    e.preventDefault();
    socket.emit('suggest-text', suggestInput.value);
    suggestInput.value = "";
});

skipForm.addEventListener('click', e => {
    e.preventDefault();
    socket.emit('skip', JSON.stringify([document.getElementById('user-id').innerHTML, !getButtonState()]));
});