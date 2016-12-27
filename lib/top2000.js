const request = require('request');
const chalk = require('chalk');
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
 * Holds the title title of song currently playing.
 */
module.exports.currentlyPlaying = '';

/**
 * Gets the song which is currently playing on NPO Radio 2 using the RadioBox2
 * API.
 */
module.exports.getCurrentlyPlayingSong = function(callback) {
    request({
        method: 'GET',
        uri: 'http://radiobox2.omroep.nl/data/radiobox2/nowonair/2.json',
        json: true
    }, function(err, res, json) {
        if (err) {
            console.error('%s Error when requesting "%s":', chalk.red('✗'), err.hostname);
            console.error('  %s\n', err.message);
            return;
        }

        if (res.statusCode === 200) {
            callback({
                title: json['results'][0]['songfile']['title'],
                artist: json['results'][0]['songfile']['artist'],
                startTime: Date.parse(json['results'][0]['startdatetime']),
                stopTime: Date.parse(json['results'][0]['stopdatetime'])
            });
        }
    });
};

/**
 * Gets the position of a given song in the Top 2000.
 */
module.exports.findSongPosition = function(title, artist) {
    for (var i = 0; i < songs['data'][0].length; ++i) {
        if (songs['data'][0][i]['s'] === title && songs['data'][0][i]['a'] === artist) {
            return songs['data'][0][i]['pos'];
        }
    }
};

/**
 * Gets a song by position from the JSON formatted Top 2000 list.
 */
module.exports.getSongByPosition = function(pos) {
    return songs['data'][0][pos - 1];
};
