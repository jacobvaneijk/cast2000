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

// Development-only configuration.
if (app.get('env') === 'development') {
    app.use(errorhandler());
}

/**
 * Primary application routes.
 */

app.get('/', homeController.index);

/**
 * Start Express server.
 */

app.listen(app.get('port'), function() {
    console.log('%s App is running at http://localhost:%d in %s.', chalk.green('✓'), app.get('port'), app.get('env'));
    console.log('  Press CTRL-C to stop.\n');
});

module.exports = app;
