const debugForm = document.getElementById('debug-form');
const eventNameInput = document.getElementById('event-input');
const parameters = document.getElementById('value-input');
const socket = io();

debugForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let event = eventNameInput.value;
    let params = parameters.value
    socket.emit(event, params);
    console.log({event, params})
    eventNameInput.value = "";
    parameters.value ="";
});
