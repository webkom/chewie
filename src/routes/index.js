var Bluebird = require('bluebird');
var express = require('express');
var redis = Bluebird.promisifyAll(require('redis'));
var config = require('../config');
var isAuthenticated = require('./auth-helpers').isAuthenticated;

var router = express.Router();

router.get('/', isAuthenticated, function(req, res) {
  var client = redis.createClient(config.REDIS_PORT, config.REDIS_HOST);

  var context = { projects: require(config.SERVER_CONFIG_FILE) };
  client.selectAsync(config.REDIS_DB)
    .then(function() {
      return client.hgetallAsync('chewie:projects');
    })
    .then(function(projects) {
      for (var key in projects) {
        if (context.projects.hasOwnProperty(key)) {
          context.projects[key].status = JSON.parse(projects[key]);
        }
      }
      res.render('index', context);
    }).catch(res.next);
});

module.exports = router;
