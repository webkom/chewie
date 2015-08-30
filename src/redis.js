var Bluebird = require('bluebird');
var redis = Bluebird.promisifyAll(require('redis'));
var config = require('./config');

var createClient = exports.createClient = function() {
  return redis.createClient(config.REDIS_PORT, config.REDIS_HOST, {
    auth_pass: config.REDIS_PASSWORD
  });
};

var client = createClient();

exports.reportDeployment = function(projectName, deploymentStatus) {
  return client
    .selectAsync(config.REDIS_DB)
    .bind(this)
    .then(function() {
      if (deploymentStatus.success) {
        return client.hsetAsync('chewie:projects', projectName, JSON.stringify(deploymentStatus));
      }
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
