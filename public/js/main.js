$(document).ready(function() {
    var socket = io();

    socket.on('song-update', function(data) {
        console.log(data);
    });
});
