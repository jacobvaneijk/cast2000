const chalk = require('chalk');
const http = require('http');

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

                io.emit('song-update', {
                    songTitle: json['results'][0]['songfile']['title'],
                    songArtist: json['results'][0]['songfile']['artist'],
                    songStartTime: json['results'][0]['startdatetime'],
                    songStopTime: json['results'][0]['stopdatetime']
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
