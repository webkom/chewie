var Bluebird = require('bluebird');
var redis = Bluebird.promisifyAll(require('redis'));
var config = require('./config');

var client = redis.createClient(config.REDIS_PORT, config.REDIS_HOST);

exports.reportDeployment = function(projectName, deploymentStatus) {
  return client.selectAsync(config.REDIS_DB).bind(this)
    .then(function() {
      return client.hsetAsync('chewie:projects', projectName, JSON.stringify(deploymentStatus));
    })
    .then(function() {
      return client.publishAsync('chewie:pubsub:deployments', JSON.stringify(deploymentStatus));
    });
};

exports.getProjects = function() {
  return client.selectAsync(config.REDIS_DB)
    .then(function() {
      return client.hgetallAsync('chewie:projects');
    });
};
