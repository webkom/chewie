#!/usr/bin/env node
var debug = require('debug');
var http = require('http');
var path = require('path');
var config = require('./src/config');
var handleMessages = require('./src/websockets/index');
var app = require('./src/app');

var server = http.Server(app);
var io = require('socket.io')(server);
debug = debug('chewie');

if (path.resolve(config.SERVER_CONFIG_FILE) !== path.normalize(config.SERVER_CONFIG_FILE)) {
  throw new Error('SERVER_CONFIG_FILE must be an absolute path.');
}

app.set('port', process.env.PORT || 3000);

server.listen(app.get('port'), function() {
  debug('Listening on port ' + server.address().port);
});

handleMessages(io);

module.exports = {
  server: server,
  io: io
};
