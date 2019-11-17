const socket = io();

socket.on('suggest-text', data => {
    console.log(data);
});