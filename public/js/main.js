$(document).ready(function() {
    var socket = io();

    socket.on('song-update', function(data) {
        if (data.currentSong.title.length > 28) {
            $('.js-current-song-title').css('font-size', '64px');
        }

        $('.js-previous-song-position').text(data.previousSong.position);
        $('.js-previous-song-artist').text(data.previousSong.artist);
        $('.js-previous-song-title').text(data.previousSong.title);

        $('.js-current-song-position').text(data.currentSong.position);
        $('.js-current-song-artist').text(data.currentSong.artist);
        $('.js-current-song-title').text(data.currentSong.title);

        $('.js-next-song-position').text(data.nextSong.position);
        $('.js-next-song-artist').text(data.nextSong.artist);
        $('.js-next-song-title').text(data.nextSong.title);
    });
});
