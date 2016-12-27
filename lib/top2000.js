const chalk = require('chalk');
const http = require('http');
const path = require('path');
const fs = require('fs');

/**
 * Read the current year's Top 2000 list in JSON format.
 */
const songs = JSON.parse(
    fs.readFileSync(
        path.resolve('./data/top2000-' + new Date().getFullYear() + '.json')
    )
);

/**
 * Gets data about Radio 2 from the Radiobox API and emits it to every connected
 * client.
 */
module.exports.update = function(io) {
    http.get({
        hostname: 'radiobox2.omroep.nl',
        path: '/data/radiobox2/nowonair/2.json'
    }, function(res) {
        if (res.statusCode !== 200) {
            console.error('%s Request failed; status code "%s":\n', chalk.red('✗'), res.statusCode);
            res.resume();
            return;
        }

        res.setEncoding('utf8');

        var data = '';

        res.on('data', function(chunk) {
            data += chunk;
        });

        res.on('end', function() {
            try {
                var json = JSON.parse(data);

                var currentSong = findSong(
                    songs,
                    json['results'][0]['songfile']['title'],
                    json['results'][0]['songfile']['artist']
                );

                var nextSong = getSongByPosition(songs, currentSong['pos'] - 1);
                var previousSong = getSongByPosition(songs, currentSong['pos'] + 1);

                io.emit('song-update', {
                    currentSong: {
                        title: currentSong['s'],
                        artist: currentSong['a'],
                        position: currentSong['pos'],
                        startTime: Date.parse(json['results'][0]['startdatetime']),
                        stopTime: Date.parse(json['results'][0]['stopdatetime'])
                    },
                    nextSong: {
                        title: nextSong['s'],
                        artist: nextSong['a'],
                        position: nextSong['pos']
                    },
                    previousSong: {
                        title: previousSong['s'],
                        artist: previousSong['a'],
                        position: previousSong['pos']
                    }
                });
            } catch (err) {
                console.error('%s Error when parsing JSON:\n', chalk.red('✗'));
                console.error('  %s\n', err.message);
            }
        });
    }).on('error', function(err) {
        console.error('%s Error when requesting "%s":', chalk.red('✗'), err.hostname);
        console.error('  %s\n', err.message);
    });
};

/**
 * Search for a given song by an artist in the JSON formatted Top 2000 list.
 */
function findSong(json, title, artist) {
    for (var i = 0; i < json["data"][0].length; ++i) {
        if (json["data"][0][i]["s"] === title && json["data"][0][i]["a"] === artist) {
            return json["data"][0][i];
        }
    }
}

/**
 * Get a song by position from the JSON formatted Top 2000 list.
 */
function getSongByPosition(json, position) {
    return json["data"][0][position - 1];
}
