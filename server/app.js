/**
 * Main application file
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express'),
    config = require('./config/environment'),
    app = express(),
    server = require('http').createServer(app),
    twitter = require('./components/twitter');

require('./config/express')(app);
require('./routes')(app);

// Start server
server.listen(config.port, config.ip, function () {
  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

// Start reading twitter feed
twitter.start();

// Expose app
exports = module.exports = app;
