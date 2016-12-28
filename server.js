/**
 * Module dependencies.
 */

const errorhandler = require('errorhandler');
const compression = require('compression');
const nunjucks = require('nunjucks');
const express = require('express');
const chalk = require('chalk');
const path = require('path');
const sass = require('node-sass-middleware');

/**
 * Controllers.
 */

const homeController = require('./controllers/home');

/**
 * Create Express server.
 */

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

/**
 * Configure Nunjucks.
 */

nunjucks.configure('views', {
    autoescape: true,
    express: app
});

/**
 * Express configuration.
 */

app.set('port', process.env.PORT || 3000);
app.use(compression());
app.use(sass({
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
    sourceMap: app.get('env') === 'development',
    outputStyle: app.get('env') === 'development' ? 'extended' : 'compressed'
}));
app.use(express.static(path.join(__dirname, 'public')));

if (app.get('env') === 'development') {
    app.use(errorhandler());
}

/**
 * Primary application routes.
 */

app.get('/', homeController.index);

/**
 * Send song informatio.
 */

const top2000 = require('./lib/top2000');

// Immediatly emit data to the new client.
io.on('connection', function(socket) {
    top2000.getCurrentlyPlayingSong(function(song) {
        song['position'] = top2000.findSongPosition(song['title'], song['artist']);

        var songNext = top2000.getSongByPosition(song['position'] - 1);
        var songPrevious = top2000.getSongByPosition(song['position'] + 1);

        socket.emit('song-update', {
            currentSong: {
                title: song['title'],
                artist: song['artist'],
                position: song['position'],
                startTime: song['starttime'],
                stopTime: song['stoptime']
            },
            nextSong: {
                title: songNext['s'],
                artist: songNext['a'],
                position: songNext['pos']
            },
            previousSong: {
                title: songPrevious['s'],
                artist: songPrevious['a'],
                position: songPrevious['pos']
            }
        });
    });
});

// Emit data to every client when a new song started playing.
setInterval(function() {
    top2000.getCurrentlyPlayingSong(function(song) {
        if (top2000.currentlyPlaying != song['title']) {
            song['position'] = top2000.findSongPosition(song['title'], song['artist']);

            var songNext = top2000.getSongByPosition(song['position'] - 1);
            var songPrevious = top2000.getSongByPosition(song['position'] + 1);

            io.emit('song-update', {
                currentSong: {
                    title: song['title'],
                    artist: song['artist'],
                    position: song['position'],
                    startTime: song['starttime'],
                    stopTime: song['stoptime']
                },
                nextSong: {
                    title: songNext['s'],
                    artist: songNext['a'],
                    position: songNext['pos']
                },
                previousSong: {
                    title: songPrevious['s'],
                    artist: songPrevious['a'],
                    position: songPrevious['pos']
                }
            });

            top2000.currentlyPlaying = song['title'];
        }
    });
}, 1000);

/**
 * Start Express server.
 */

server.listen(app.get('port'), function() {
    console.log('%s App is running at http://localhost:%d in %s.', chalk.green('✓'), app.get('port'), app.get('env'));
    console.log('  Press CTRL-C to stop.\n');
});

module.exports = app;
