var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));

var config = require('../config');

exports.getPublicKey = function(req, res, next) {
  fs.readFileAsync(config.PATH_TO_PUBLIC_KEY)
    .then(function(key) {
      res.set('Content-Type', 'text/plain');
      res.send(key.toString());
    })
    .catch(next);
};
